from flask import Flask
from flask_socketio import SocketIO

def create_agent_network_socket(agent_network):

    app = Flask(__name__)
    network_io = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

    @network_io.on('connect')
    def handle_connect():
        print("Client connected")
        graph_data(None)
        get_available_agents_instantiations(None)
    
    @network_io.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @network_io.on('graph_data')
    def graph_data(data=None):
        # print(filler)
        data = agent_network.get_graph_data()
        print(data)
        network_io.emit('graph_data', data)

    @network_io.on('graph_data_updated')
    def graph_data_updated(data=None):
        data = agent_network.get_graph_data_updated()
        print(data)
        network_io.emit('graph_data_updated', data)

    @network_io.on('node_chat')
    def get_node_chat(node_id):
        node = agent_network.get_agent_dictionary()[node_id]
        network_io.emit('node_chat', node.get_chat_history())

    @network_io.on('node_inbox')
    def get_node_inbox(node_id):
        node = agent_network.get_agent_dictionary()[node_id]
        network_io.emit('node_inbox', node.get_inbox())

    @network_io.on('node_error_log')
    def get_error_log(node_id):
        node = agent_network.get_agent_dictionary()[node_id]
        network_io.emit('node_error_log', node.get_error_log())

    @network_io.on('link_chat')
    def get_link_chat(ids):
        source_id, target_id = ids
        source = agent_network.get_agent_dictionary()[source_id]
        # target = agent_network.get_agent_dictionary()[target_id]
        network_io.emit('link_chat', source.get_chat_history(target_id))

    @network_io.on('toggle_node_status')
    def toggle_node_status(node_id):
        if 'user' not in node_id:
            node = agent_network.get_agent_dictionary()[node_id]
            event_loop = agent_network.get_event_loop()
            if node.run_status:
                node.stop()
            else:
                node.start(event_loop)
        # node.run_status = not node.run_status
        # network_io.emit('node_status', node.run_status)

    @network_io.on('toggle_node_status_all')
    def toggle_node_status_all(data):
        print('toggle_node_status_all', data)
        if data:
            for node in agent_network.get_agent_dictionary().values():
                if not node.run_status:
                    node.start(agent_network.get_event_loop())
        else:
            for node in agent_network.get_agent_dictionary().values():
                if node.run_status:
                    node.stop()

    @network_io.on('send_message')
    def send_message(data):
        # print(data)
        sender, recipient, message = data['sender'], data['recipient'], data['message']
        agent_network.send_message_by_name_uuid(message, sender, recipient)
        # agent_network.get_agent_dictionary()[sender].send_message(message, recipient)    

    @network_io.on('connect_nodes')
    def connect_nodes(data):
        print(data)
        source, target = data['source'], data['target']
        agent_network.connect_agents_by_name_uuid(source, target)

    @network_io.on('remove_link')
    def remove_link(data):
        source, target = data['source'], data['target']
        agent_network.disconnect_agents_by_name_uuid(source, target)

    @network_io.on('remove_node')
    def remove_node(node_id):
        agent_network.remove_agent_by_name_uuid(node_id)

    @network_io.on('get_available_agents_instantiations')
    def get_available_agents_instantiations(data=None):
        # agent_network.get_available_agent_instantiations()
        network_io.emit('available_agents_instantiations', agent_network.get_available_agent_instantiations())

    @network_io.on('create_node')
    def create_node(data):
        print(data)
        agent_network.create_agent(data['agentBase'], data['name'], data['description'], data['prompt'])

    @network_io.on('get_edit_node_params')
    def get_node_params(data):
        node = agent_network.get_agent_dictionary()[data]
        network_io.emit('get_edit_node_params', node.get_edit_node_params())

    @network_io.on('edit_node')
    def edit_node(data):
        print(data)
        agent_network.edit_agent(data['id'], data['name'], data['description'], data['prompt'])

    @network_io.on('copy_node')
    def copy_node(data):
        print(data)
        agent_network.copy_agent_by_name_uuid(data)

    functions = {
        'graph_data': graph_data,
        'graph_data_updated': graph_data_updated,
        'node_chat': get_node_chat,
        'link_chat': get_link_chat,
        'toggle_node_status': toggle_node_status,
        'toggle_node_status_all': toggle_node_status_all,
        'send_message': send_message,
        'connect_nodes': connect_nodes,
        'remove_link': remove_link,
        'remove_node': remove_node,
        'get_available_agents_instantiations': get_available_agents_instantiations,
        'create_node': create_node,
        'get_edit_node_params': get_node_params,
        'edit_node': edit_node,
        'copy_node': copy_node
    }

    return app, network_io, functions
