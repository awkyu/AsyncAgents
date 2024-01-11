from flask import Blueprint, jsonify
from flask_cors import CORS

def create_network_blueprint(agent_network):

    network_bp = Blueprint('network', __name__)
    CORS(network_bp)

    @network_bp.route('/')
    def hello_world():
        return 'Hello, World!'

    @network_bp.route('/data')
    def data():
        # # Replace this with real data fetching and processing
        # sample_data = {
        #     'nodes': [{'id': '1', 'name': 'Node 1'}, {'id': '2', 'name': 'Node 2'}],
        #     'links': [{'source': '1', 'target': '2'}]
        # }
        # return jsonify(sample_data)

        data = {
            'nodes': [{'id': agent.get_description_json()['name_uuid'], 'name': agent.get_description_json()['name']} for agent in agent_network.get_agent_dictionary().values()],
            'links': [{'source': agent.get_description_json()['name_uuid'], 'target': recipient.get_description_json()['name_uuid']} for agent in agent_network.get_agent_dictionary().values() for recipient in agent.recipients.values()]
        }
        return jsonify(data)

    @network_bp.route('/node/<node_id>')
    def get_node_chat(node_id):
        node = agent_network.get_agent_dictionary()[node_id]
        return jsonify(node.get_chat_history())

    @network_bp.route('/link/<source_id>/<target_id>')
    def get_link_chat(source_id, target_id):
        source = agent_network.get_agent_dictionary()[source_id]
        target = agent_network.get_agent_dictionary()[target_id]
        return jsonify(source.get_chat_history(target))

    return network_bp
