from flask import Flask
from NetworkRoutes import create_network_blueprint
from AgentNetworkSocket import create_agent_network_socket
from AgentNetwork import AgentNetwork

class NetworkServer:

    def __init__(self, agent_network: AgentNetwork, event_loop=None):
        self.app, self.network_io, self.network_functions = create_agent_network_socket(agent_network)
        self.agent_network = agent_network
        self.agent_network.set_network_io(self.app, self.network_io, self.network_functions)
        self.agent_network.set_event_loop(event_loop)

    def run(self, debug=True, use_reloader=True, port=5000, allow_unsafe_werkzeug=False):
        self.network_io.run(self.app, debug=debug, use_reloader=use_reloader, port=port, allow_unsafe_werkzeug=allow_unsafe_werkzeug)


# class NetworkServer:

#     def __init__(self, agent_network):
#         self.network = agent_network
#         self.app = Flask(__name__)

#         @self.app.route('/')
#         def hello_world(self):
#             return 'Hello, World!'

#         @self.app.route('/data')
#         def data(self):
#             # Replace this with real data fetching and processing
#             sample_data = {
#                 'nodes': [{'id': '1', 'name': 'Node 1'}, {'id': '2', 'name': 'Node 2'}],
#                 'links': [{'source': '1', 'target': '2'}]
#             }
#             return jsonify(sample_data)

#         @self.app.route('/node/<node_id>')
#         def get_node_chat(self, node_id):
#             node = self.network.get_agent_dictionary()[node_id]
#             return jsonify(node.get_chat_history())

#         @self.app.route('/link/<source_id>/<target_id>')
#         def get_link_chat(self, source_id, target_id):
#             source = self.network.get_agent_dictionary()[source_id]
#             target = self.network.get_agent_dictionary()[target_id]
#             return jsonify(source.get_chat_history(target))

#     def run(self):
#         self.app.run(debug=True)

#     def stop(self):
#         self.app.stop()
