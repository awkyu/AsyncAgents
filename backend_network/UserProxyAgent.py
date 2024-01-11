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


class UserProxyAgent:
    BASE = "UserProxyAgent"
    DEFAULT_SYSTEM_PROMPT = None
    DESCRIPTION = None
    NAME = "User"

    def __init__(self, agent_network=None):
        # Initialize input vars
        self.name = 'User'

        # self.description = "This is a user proxy agent. It is used to send messages to other agents as a user."
        self.description = self.DESCRIPTION

        # initialize additional vars
        self.system_prompt = self.DEFAULT_SYSTEM_PROMPT
        self.inbox = Queue() # in this case the inbox is essentially our chat history
        self.chat_history_gui = []
        self.error_log = []
        self.network_app = None
        self.network_io = None
        self.network_functions = None
        self.uuid = uuid.uuid4()
        self.name_uuid = f"{self.name}_{self.uuid}"
        self.recipients = {} # {name_uuid: agent, ...}
        self.agent_network = agent_network
        if self.agent_network:
            self.agent_network.add_agent(self)

        self.run_status = True
        self.status = "Running"

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
        }

    def get_edit_node_params(self):
        return {
            "id": self.name_uuid,
            "base": self.BASE,
            "name": self.name,
            "description": self.description,
            "prompt": self.system_prompt,
        }

    def generate_new_uuid(self):
        self.uuid = uuid.uuid4()
        self.name_uuid = f"{self.name}_{self.uuid}"
        self.build_agent()

    def reset(self):
        self.generate_new_uuid()
        self.chat_history_gui = []
        self.error_log = []
        self.inbox = Queue()
        self.recipients = {}
        self.run_status = False
        self.status = "Stopped"

    def update_name(self, name):
        pass

    def update_description(self, description):
        pass

    def update_system_prompt(self, system_prompt):
        pass

    def add_message(self, message, sender):
        self.chat_history_gui.append(
            {"sender": sender, "recipient": self.name_uuid, "text": message, "timestamp": int(time.time()*1000)},
        )
        self.inbox.put({"message": message, "sender": sender})
        self.network_io.emit('inbox_updated', {self.name_uuid: list(self.inbox.queue)})

    def get_inbox(self):
        return list(self.inbox.queue)

    def send_message(self, message, recipient_name_uuid):
        recipient = self.recipients[recipient_name_uuid]
        recipient.add_message(message, self.name_uuid)
        new_message = {"sender": self.name_uuid, "recipient": recipient_name_uuid, "text": message, "timestamp": int(time.time()*1000)}
        self.chat_history_gui.append(new_message)
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('new_message', new_message)
        # self.inbox.put({"message": message, "sender": self.name_uuid})

    def get_chat(self):
        """
        Get the current chat history of the user proxy agent. This is a list of strings formatted as follows:
        [sender]: [message]
        """
        return [f"{message['sender']}: {message['message']}" for message in self.inbox.queue]

    def get_chat_history(self, recipient=None):
        # print(self.name_uuid, recipient)
        # print(self.chat_history_gui)
        if recipient:
            filtered_messages = []
            for message in self.chat_history_gui:
                print(message)
                if (message["sender"] == self.name_uuid and message["recipient"] == recipient) or (message["sender"] == recipient and message["recipient"] == self.name_uuid):
                    filtered_messages.append(message)
            return filtered_messages
        # if recipient:
        #     return [m for m in self.chat_history_gui if ((m["sender"] == self.name_uuid and m["recipient"] == recipient) or (m["sender"] == recipient and m["recipient"] == self.name_uuid))]
        return self.chat_history_gui

    def add_error(self, error):
        self.error_log.append({"error": error, "timestamp": int(time.time()*1000)})
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('error_log_updated', {self.name_uuid: self.error_log})

    def get_error_log(self):
        return self.error_log

    def start(self):
        pass

    def stop(self):
        pass
