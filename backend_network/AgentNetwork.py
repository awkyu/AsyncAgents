import math
import copy


class AgentNetwork:

    def __init__(self, agent_list={}, event_loop=None, available_agent_instantiations=[]):
        self.agent_dictionary = {agent.get_description_json()["name_uuid"]: agent for agent in agent_list}
        self.agent_graph = {}
        self.network_app = None
        self.network_io = None
        self.network_functions = None
        self.last_graph_data = None
        self.event_loop = event_loop
        self.available_agent_instantiations = {agent.BASE: agent for agent in available_agent_instantiations}

    def get_available_agent_instantiations(self):
        return {agent.BASE: {'name': agent.NAME, 'system_prompt': agent.DEFAULT_SYSTEM_PROMPT, 'description': agent.DESCRIPTION} for agent in self.available_agent_instantiations.values()} 

    def get_event_loop(self):
        return self.event_loop

    def set_event_loop(self, event_loop):
        self.event_loop = event_loop

    def set_network_io(self, network_app, network_io, network_functions):
        self.network_app = network_app
        self.network_io = network_io
        self.network_functions = network_functions
        for agent in self.agent_dictionary.values():
            agent.set_network_io(network_app, network_io, network_functions)

    def create_agent(self, agent_base, name, description, prompt):
        if agent_base in self.available_agent_instantiations.keys():
            agent_base_cls = self.available_agent_instantiations[agent_base]
            if agent_base == "UserProxyAgent":
                agent = agent_base_cls()
            else:
                agent = agent_base_cls(name=name, description=description)
                agent.update_system_prompt(prompt)
            self.add_agent(agent)
        else:
            print(f"Agent base {agent_base} not found in available agent instantiations")

    def add_agent(self, agent):
        self.agent_dictionary[agent.get_description_json()["name_uuid"]] = agent
        if self.network_io and self.network_app:
            # self.network_io.start_background_task(self.network_functions['graph_data'])

            with self.network_app.app_context():
                # self.network_functions['graph_data']()
                # self.network_io.emit('graph_data', self.get_graph_data())
                self.network_io.emit('graph_data_updated', self.get_graph_data_updated())

    def edit_agent(self, agent_name_uuid, name, description, prompt):
        agent = self.agent_dictionary[agent_name_uuid]
        agent.update_name(name)
        agent.update_description(description)
        agent.update_system_prompt(prompt)
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('graph_data_updated', self.get_graph_data_updated())

    def copy_agent_by_name_uuid(self, agent_name_uuid):
        agent = self.agent_dictionary[agent_name_uuid]
        if type(agent).BASE == "UserProxyAgent":
            new_agent = type(agent)()
        else:
            new_agent = type(agent)(name=agent.name, description=agent.description)
            new_agent.update_system_prompt(agent.system_prompt)
            new_agent.run_status = False
            new_agent.status = "Stopped"
            new_agent.add_tools(agent.tools)
        self.add_agent(new_agent)
        
    def remove_agent_by_name_uuid(self, agent_name_uuid):
        agent = self.agent_dictionary[agent_name_uuid]
        connections_to_remove = list(agent.recipients.keys())
        print(connections_to_remove)
        for recipient_name_uuid in connections_to_remove:
            self.disconnect_agents(agent, self.agent_dictionary[recipient_name_uuid])
        self.agent_dictionary.pop(agent_name_uuid)
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('graph_data_updated', self.get_graph_data_updated())

    def get_graph_data(self):  
        data = {
            'nodes': [{
                'id': agent.get_description_json()['name_uuid'], 
                'label': agent.get_description_json()['name_uuid'], 
                'type': agent.get_description_json()['name'],
                'running': agent.run_status,
                'status': agent.status,
            } for agent in self.agent_dictionary.values()],
            'links': [{
                'id': f"{agent.get_description_json()['name_uuid']}_{recipient.get_description_json()['name_uuid']}",
                'source': agent.get_description_json()['name_uuid'], 
                'target': recipient.get_description_json()['name_uuid'],
                'curvature': 0.2,
                'rotation': math.pi,
            } for agent in self.agent_dictionary.values() for recipient in agent.recipients.values()]
        }
        if self.last_graph_data is None:
            self.last_graph_data = data
        return data

    def get_graph_data_updated(self):
        data = self.get_graph_data()
        new_data = {
            'nodes': [],
            'links': [],
        }
        for node in data['nodes']:
            found = False
            for old_node in self.last_graph_data['nodes']:
                if node['id'] == old_node['id']:
                    found = True
                    break
            if not found:
                new_data['nodes'].append(node)
        for link in data['links']:
            found = False
            for old_link in self.last_graph_data['links']:
                if link['id'] == old_link['id']:
                    found = True
                    break
            if not found:
                new_data['links'].append(link)
        changed_data = {
            'nodes': [node for node in data['nodes'] if node not in self.last_graph_data['nodes'] and node['id'] not in [n['id'] for n in new_data['nodes']]],
            'links': [link for link in data['links'] if link not in self.last_graph_data['links'] and link['id'] not in [l['id'] for l in new_data['links']]]
        }
        deleted_data = {
            'nodes': [node for node in self.last_graph_data['nodes'] if node not in data['nodes']],
            'links': [link for link in self.last_graph_data['links'] if link not in data['links']]
        }
        output_data = {
            'new': new_data,
            'changed': changed_data,
            'deleted': deleted_data,
        }
        self.last_graph_data = data
        return output_data

    def get_agent_dictionary(self):
        print(self.agent_dictionary)
        return self.agent_dictionary

    def connect_agents(self, agent1, agent2):
        agent1_uuid = agent1.get_description_json()["name_uuid"]
        agent2_uuid = agent2.get_description_json()["name_uuid"]
        agent1.recipients.update({agent2_uuid: agent2})
        agent2.recipients.update({agent1_uuid: agent1})
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('graph_data_updated', self.get_graph_data_updated())

    def connect_agents_by_name_uuid(self, agent1_uuid, agent2_uuid):
        agent1 = self.agent_dictionary[agent1_uuid]
        agent2 = self.agent_dictionary[agent2_uuid]
        if agent1_uuid == agent2_uuid:
            print("Cannot connect agent to itself")
            agent1.add_error("Cannot connect agent to itself")
            return
        if agent1_uuid in agent2.recipients.keys() or agent2_uuid in agent1.recipients.keys():
            print("Agents already connected")
            agent1.add_error(f"Already connected to {agent2_uuid}")
            agent2.add_error(f"Already connected to {agent1_uuid}")
            return
        agent1.recipients.update({agent2_uuid: agent2})
        agent2.recipients.update({agent1_uuid: agent1})
        agent1.add_error(f"Connected to {agent2_uuid}")
        agent2.add_error(f"Connected to {agent1_uuid}")

        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('graph_data_updated', self.get_graph_data_updated())

    def disconnect_agents(self, agent1, agent2):
        agent1_uuid = agent1.get_description_json()["name_uuid"]
        agent2_uuid = agent2.get_description_json()["name_uuid"]
        agent1.recipients.pop(agent2_uuid)
        agent2.recipients.pop(agent1_uuid)
        if self.network_io and self.network_app:
            # self.network_io.start_background_task(self.network_functions['graph_data'])
            with self.network_app.app_context():
                # self.network_functions['graph_data']()
                # self.network_io.emit('graph_data', self.get_graph_data())
                self.network_io.emit('graph_data_updated', self.get_graph_data_updated())

    def disconnect_agents_by_name_uuid(self, agent1_uuid, agent2_uuid):
        agent1 = self.agent_dictionary[agent1_uuid]
        agent2 = self.agent_dictionary[agent2_uuid]
        agent1.recipients.pop(agent2_uuid)
        agent2.recipients.pop(agent1_uuid)
        if self.network_io and self.network_app:
            with self.network_app.app_context():
                self.network_io.emit('graph_data_updated', self.get_graph_data_updated())

    def get_connections(self, agent):
        return str([agent.get_description_json() for agent in agent.recipients.values()])

    def get_connections_by_name_uuid(self, agent_name_uuid):
        agent = self.agent_dictionary[agent_name_uuid]
        return str([agent.get_description_json() for agent in agent.recipients.values()])

    def send_message_by_name_uuid(self, message, agent_name_uuid_sender, agent_name_uuid_recipient):
        agent_sender = self.agent_dictionary[agent_name_uuid_sender]
        agent_recipient = self.agent_dictionary[agent_name_uuid_recipient]
        agent_sender.send_message(message, agent_name_uuid_recipient)
        return "Message sent"
