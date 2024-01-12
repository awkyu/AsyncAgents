from server.AgentNetworkSocket import create_agent_network_socket
from network.AgentNetwork import AgentNetwork


class NetworkServer:

    def __init__(self, agent_network: AgentNetwork, event_loop=None):
        self.app, self.network_io, self.network_functions = create_agent_network_socket(agent_network)
        self.agent_network = agent_network
        self.agent_network.set_network_io(self.app, self.network_io, self.network_functions)
        self.agent_network.set_event_loop(event_loop)

    def run(self, debug=True, use_reloader=True, port=5000, allow_unsafe_werkzeug=False):
        self.network_io.run(self.app, debug=debug, use_reloader=use_reloader, port=port, allow_unsafe_werkzeug=allow_unsafe_werkzeug)

