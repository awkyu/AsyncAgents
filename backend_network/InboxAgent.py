from queue import Queue
import asyncio
import uuid
from dotenv import load_dotenv

from pydantic import BaseModel
import json
import os
import requests
from googleapiclient.discovery import build
import pprint
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain import PromptTemplate
from langchain.chains.summarize import load_summarize_chain
from langchain.chat_models import ChatOpenAI
from autogen import config_list_from_json
from autogen.agentchat.contrib.gpt_assistant_agent import GPTAssistantAgent
from autogen.agentchat.agent import Agent
from autogen import UserProxyAgent
from openai import OpenAI
import autogen
import time

from collections import defaultdict
from queue import Queue

from langchain.agents import AgentExecutor
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools.render import format_tool_to_openai_function
from langchain.tools import Tool
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.memory import ConversationBufferMemory
from langchain.agents import Agent
from typing import List, Literal
from langchain.schema.messages import (
    AIMessage,
    AnyMessage,
    BaseMessage,
    ChatMessage,
    HumanMessage,
    SystemMessage,
    get_buffer_string,
)


class RespondToMessageInput(BaseModel):
    message: str = "The message you want to send to the recipient"
    agent_name_uuid: str = "The name_uuid of the agent you want to send the message to"


class InboxAgent:
    BASE = "Inbox Agent (Default)"
    DEFAULT_SYSTEM_PROMPT = """
        You are an AI agent assistant. You are processing messages from a broad range of users and other AI agents that are placed in your 'inbox'. Users will be denoted as user_<uuid>. AI agents will be denoted as <agent-type>_<uuid>. You will be denoted as {name_uuid}.
        Your job is to respond to messages from users and other AI agents. 

        You can use the following tools to help you respond to messages:
        <tools>
        {tools}
        </tools>
        You DON'T need to use these tools, unless you find them appropriate for the task. Also don't make up tools that you don't have.


        For each message you process, you will determine who you should respond to (the recipient) and what that response is (the content). This may be multiple users or AI agents. You are connected to the following agents and users: 
        <recipients>
        {recipients}
        </recipients>
        These are NOT functions, but rather names and descriptions of agents and users. Each recipient should be treated INDIVIDUALLY as they CANNOT see the messages you send to each of them. You DON'T need to send messages to all of your recipients, only the ones you feel necessary. For recipients that you are not directly replying to (they are not the sender of the input/message), state both your response and reason to reach out to them. 


        These responses may be confirmations, relays of information, or a new request/task.


        Here is an additional description about yourself and who you should role-play as:
        <description>
        {description}
        </description>

        Your response should ONLY be in a json format with the keys as the recipient and the values as the response. Include the curly braces too. This should ONLY be ONE JSON/dict output. For example,
        if you want to send recipient1 the message content1 and recipient2 the message content2, you should respond with:
        ("recipient1": "content1", "recipient2": "content2", ...)


        You should ONLY respond to available recipients and ONLY speak for yourself. The recipient should NEVER be yourself. You can relay information, but should NOT make up what other agents have said.
    """
    DESCRIPTION = ""
    NAME = ""

    def __init__(self, name, description, llm=None, tools=[], agent_network=None, oai=True):
        # Initialize input vars
        self.name = name
        if llm:
            self.llm = llm
        else:
            self.llm = ChatOpenAI(model="gpt-4-1106-preview", temperature=0)
        self.tools = tools
        self.description = description
        self.oai = oai

        # initialize additional vars
        self.system_prompt = self.DEFAULT_SYSTEM_PROMPT
        self.memory_key = "chat_history"
        self.chat_history = []
        self.chat_history_gui = []
        self.error_log = []
        self.network_app = None
        self.network_io = None
        self.network_functions = None
        self.inbox = Queue()
        self.agent = None
        self.uuid = uuid.uuid4()
        self.name_uuid = f"{self.name}_{self.uuid}"
        self.recipients = {} # {name_uuid: agent, ...}
        self.agent_network = agent_network
        if self.agent_network:
            self.agent_network.add_agent(self)

        self.run_status = False
        self.status = "Stopped"

        self.initialize_agent()

    def initialize_agent(self):
        self.setup_prompt_template()
        if self.oai:
            self.setup_oai_tools()
        self.build_agent()

    def set_network_io(self, network_app, network_io, network_functions):
        self.network_app = network_app
        self.network_io = network_io
        self.network_functions = network_functions

    def get_description_json(self):
        return {
            "name": self.name,
            "uuid": self.uuid,
            "name_uuid": self.name_uuid,
            "description": self.description,
            "prompt": self.prompt,
            "tools": [t.to_json() for t in self.tools]
        }
    
    def get_edit_node_params(self):
        return {
            "id": self.name_uuid,
            "base": self.BASE,
            "name": self.name,
            "description": self.description,
            "prompt": self.system_prompt,
        }

    def update_name(self, name):
        self.name = name
        self.name_uuid = f"{self.name}_{self.uuid}"
        self.build_agent()

    def generate_new_uuid(self):
        self.uuid = uuid.uuid4()
        self.name_uuid = f"{self.name}_{self.uuid}"
        self.build_agent()

    def reset(self):
        self.generate_new_uuid()
        self.chat_history = []
        self.chat_history_gui = []
        self.error_log = []
        self.inbox = Queue()
        self.recipients = {}
        self.run_status = False
        self.status = "Stopped"
        self.initialize_agent()

    def update_description(self, description):
        self.description = description
        self.build_agent()

    def update_system_prompt(self, system_prompt):
        self.system_prompt = system_prompt
        self.setup_prompt_template()
        self.build_agent()

    def add_tools(self, tools):
        self.tools.extend(tools)
        self.setup_oai_tools()
        self.build_agent()

    def setup_prompt_template(self):
        self.prompt = self.system_prompt
        self.prompt_template = ChatPromptTemplate.from_messages(
            [
                ("system", self.prompt),
                MessagesPlaceholder(variable_name=self.memory_key),
                ("user", "{sender}: {input}"),
                # ("user", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )
    
    def setup_oai_tools(self):
        self.llm = self.llm.bind(functions=[format_tool_to_openai_function(t) for t in self.tools])
    
    def build_agent(self):
        # Step 5: Create the agent
        self.agent = (
            {
                "sender": lambda x: x["sender"],
                "input": lambda x: x["input"],
                "tools": lambda x: str([t.description for t in self.tools]),
                "recipients": lambda x: str([r for r in self.recipients.keys()]),
                "name_uuid": lambda x: self.name_uuid,
                "description": lambda x: self.description,
                "agent_scratchpad": lambda x: format_to_openai_function_messages(x["intermediate_steps"]),
                "chat_history": lambda x: x["chat_history"],
            }
            | self.prompt_template
            | self.llm
            | OpenAIFunctionsAgentOutputParser()
        )
        # Step 6: Create the AgentExecutor
        self.agent_executor = AgentExecutor(agent=self.agent, tools=self.tools, verbose=True)

    
    def add_message(self, message, sender):
        self.chat_history_gui.append(
            {"sender": sender, "recipient": self.name_uuid, "text": message, "timestamp": int(time.time()*1000)}
        )
        self.inbox.put({"message": message, "sender": sender})
        self.network_io.emit('inbox_updated', {self.name_uuid: list(self.inbox.queue)})

    def send_message(self, message, recipient_name_uuid):
        recipient = self.recipients[recipient_name_uuid]
        recipient.add_message(message, self.name_uuid)
        new_message = {"sender": self.name_uuid, "recipient": recipient_name_uuid, "text": message, "timestamp": int(time.time()*1000)}
        self.chat_history_gui.append(new_message)
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('new_message', new_message)
        # self.inbox.put({"message": message, "sender": self.name_uuid})

    def get_inbox(self):
        return list(self.inbox.queue)

    def get_chat_history(self, recipient=None):
        if recipient:
            # print(self.chat_history_gui)
            # print(recipient)
            return [m for m in self.chat_history_gui if ((m["sender"] == self.name_uuid and m["recipient"] == recipient) or (m["sender"] == recipient and m["recipient"] == self.name_uuid))]
        return self.chat_history_gui

    async def invoke_agent(self, input, sender):

        # Step 7: Invoke the agent
        output = await self.agent_executor.ainvoke(
            {
                "sender": sender,
                "input": input,
                "chat_history": self.chat_history,
            }
        )
        # Step 8: Update the memory
        self.chat_history.extend([
            HumanMessage(content=f"{sender}: {input}"),
            AIMessage(content=f"{output['output']}"),
        ])

        return output

    def start(self, event_loop=None):
        self.run_status = True
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('run_status_updated', {self.name_uuid: self.run_status})
        if event_loop:
            asyncio.run_coroutine_threadsafe(self.run(), event_loop)
        else:
            asyncio.create_task(self.run())

    def stop(self):
        self.run_status = False
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('run_status_updated', {self.name_uuid: self.run_status})

    def update_status(self, status):
        self.status = status
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('status_updated', {self.name_uuid: self.status})

    def add_error(self, error):
        self.error_log.append({"error": error, "timestamp": int(time.time()*1000)})
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('error_log_updated', {self.name_uuid: self.error_log})

    def get_error_log(self):
        return self.error_log

    async def run(self):
        idle_counter = 50
        counter = 0

        response_counter = 2
        response_count = 0
        while self.run_status:
            self.update_status("Idle")
            # Step 1: Get input
            if self.inbox.empty():
                await asyncio.sleep(1)
                counter += 1
                if counter > idle_counter:
                    print("Idle break", self.name_uuid)
                    self.add_error(f"Idle after {idle_counter} seconds of no new messages")
                    self.stop()
                    self.update_status("Stopped")
                    break
                continue
            if response_count > response_counter:
                print("Response count break", self.name_uuid)
                self.add_error(f"Response count break: {response_count} > {response_counter}")
                self.stop()
                self.update_status("Stopped")
                break

            self.update_status("Running")
            input = self.inbox.get()
            # Step 2: Invoke the agent
            output = await self.invoke_agent(input["message"], input["sender"])
            response_count += 1
            if output["output"] == "TERMINATE":
                print("Terminate break", self.name_uuid)
                self.add_error("Terminated from other agent")
                self.stop()
                self.update_status("Stopped")
                break

            pprint.pprint(output)
            try:
                out_going_messages = json.loads(output["output"])
                for recipient_name_uuid, response in out_going_messages.items():
                    recipient_agent = self.recipients[recipient_name_uuid]
                    recipient_agent.add_message(response, self.name_uuid)
                    new_message = {"sender": self.name_uuid, "recipient": recipient_name_uuid, "text": response, "timestamp": int(time.time()*1000)}
                    self.chat_history_gui.append(new_message)
                    if self.network_io and self.network_app:
                        with self.network_app.app_context():
                            self.network_io.emit('new_message', new_message)

                counter = 0
            except Exception as e:
                print(e)
                print("Invalid output from", self.name_uuid)
                pprint.pprint(output['output'])
                self.stop()
                self.update_status("Stopped")
                break

        self.update_status("Stopped")
