# AsyncAgents

This is a basic multi-agent framework for running agents in an asynchronous manner with an accompanying 3D graph interactive experience. It was inspired by a mix of modern-day social media graphs for communication and an email system where people get messages in their "inbox," hence the "InboxAgent" being the default AI agent here. This framework works with a frontend webapp counterpart [agent-network-visualizer](https://github.com/awkyu/AsyncAgents/tree/main/agent-network-visualizer), but can also work as a standalone framework. The example [notebook](https://github.com/awkyu/AsyncAgents/blob/main/async_agents/examples/ExampleServerNotebook.ipynb) should give you an idea for both the standalone operations as well as setting up a flask server for the frontend visualization.

[Insert Image/GIF here]

# Why asynchronous?

I've only recently been exploring the plethora of multi-agent frameworks and most of them emphasize examples of synchronous communication between agents (that, or I haven't really explored deep enough). And, this is for good reason. Similar to race conditions within threading or any shared-memory situation, processes or, in this case, agents running in parallel at different speeds can create less predictable outcomes.\
\
However, I wanted to build out this framework to explore its potentials because I felt that this type of interaction feels more natural and "human" (which sounds scary out of context, lol). Especially, as LLMs or LMMs (now) become more powerful, asynchronous agents may become more predictable or reliable. This is important for when agents become more integrated into society too.\
\
That being said, asynchronous agents is also hard to run now because of compute power and requires good infrastructure. Currently this only supports (has been tested with) OpenAI's GPT-4 to simplify this infrastructure demand, but I'd love to expand on this in the future.

# Why to not only use the frontend and have a notebook too?

Currently, its a bit hard to instantiate complex agents from the frontend alone. However, with the notebook setup, users can instantiate agents in real-time with more complex functions, access to vector databases, RAG, and other data sources.

# Requirements and Installation

Follow the setup guide for both the [core/backend](https://github.com/awkyu/AsyncAgents/tree/main/async_agents) as well as the [frontend web-app](https://github.com/awkyu/AsyncAgents/tree/main/agent-network-visualizer).


# TODO
- Refactor code - create additional utils for tooling and more complex agents
- Add/test more complex examples that include RAG, vector databases, access to external API's. (I plan to do this with the classic travel planning in the near future).
- Add/test other LLM and locally-ran models (is that possible/do I have the compute power, lol)
- Deploy to AWS to allow for lower barrier to explore.
- Add database to save networks between sessions.

# Contact
If you have any questions or want to work together, feel free to contact me: alexanderkyu@gmail.com or akyu2@alumni.cmu.edu
