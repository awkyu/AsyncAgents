# AsyncAgents - Core (includes Flask Server)

This is a basic framework for running agents in an asynchronous manner. It was inspired by a mix of modern-day social media graphs for communication and an email system where people get messages in their "inbox," hence the "InboxAgent" being the default AI agent here. This framework works with a frontend webapp counterpart [agent-network-visualizer](https://github.com/awkyu/AsyncAgents/tree/main/agent-network-visualizer), but can also work as a standalone framework. The example [notebook](https://github.com/awkyu/AsyncAgents/blob/main/async_agents/examples/ExampleServerNotebook.ipynb) should give you an idea for both the standalone operations as well as setting up a flask server for the frontend visualization.

![Alt Text](https://github.com/awkyu/AsyncAgents/blob/main/media/demo.gif)

# Why asynchronous?

I've only recently been exploring the plethora of multi-agent frameworks and most of them emphasize examples of synchronous communication between agents (that, or I haven't really explored deep enough). And, this is for good reason. Similar to race conditions within threading or any shared-memory situation, processes or, in this case, agents running in parallel at different speeds can create less predictable outcomes.\
\
However, I wanted to build out this framework to explore its potentials because I felt that this type of interaction feels more natural and "human" (which sounds scary out of context, lol). Especially, as LLMs or LMMs (now) become more powerful, asynchronous agents may become more predictable or reliable. This is important for when agents become more integrated into society too.\
\
That being said, asynchronous agents is also hard to run now because of compute power and requires good infrastructure. Currently this only supports (has been tested with) OpenAI's GPT-4 to simplify this infrastructure demand, but I'd love to expand on this in the future.

# Why to not only use the frontend and have a notebook too?

Currently, its a bit hard to instantiate complex agents from the frontend alone. However, with the notebook setup, users can instantiate agents in real-time with more complex functions, access to vector databases, RAG, and other data sources.

# Requirements and Installation
These are the versions of software I used when developing this, but does not mean that it won't work on other versions.

I personally used node Python 3.8.16.

1. Install Anaconda or Pip

2. Create conda environment or virtualenv. I would recommend the conda environment.

   If you are using conda:
   ```sh
   conda env create -f environment.yml
   ```
   OR
   ```sh
   conda create --name <env_name> --file requirements.txt
   ```
   \
   If you are using virtualenv:
   ```sh
   pip install -r requirements.txt
   ```

3. Get your OpenAI API Key. OpenAI's GPT-4 is the only currently supported/tested model. Check out their API website and sign up.\
https://openai.com/product#made-for-developers

4. Create .env file  and place the following in the file:

   ```sh
   OPENAI_API_KEY=<your-openai-api-key>
   ```

5. You are good to go! Follow the example files as desired.

