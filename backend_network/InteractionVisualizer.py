import dash
from dash import html, dcc
import dash_cytoscape as cyto
from dash.dependencies import Input, Output


class InteractionVisualizer:
    def __init__(self, agent_network, update_interval=1000):
        self.app = dash.Dash(__name__)
        self.agent_network = agent_network
        self.setup_layout()
        self.setup_callbacks()
        self.update_interval = update_interval

    def setup_layout(self):
        edge_style = {
            'selector': 'edge',
            'style': {
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                # 'source-arrow-shape': 'triangle'
            }
        }

        node_style = {
            'selector': 'node',
            'style': {
                'label': 'data(label)',
                'text-wrap': 'wrap',
                # 'text-max-width': '200px',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': 'gray',
                # 'border-color': 'black',
                # 'border-width': '1px',
                # 'border-opacity': '1',
                # 'shape': 'roundrectangle',
                'width': '100px',
                'height': '100px',
                'font-size': '16px',
            }
        }

        core_style = {
            'selector': 'core',
            'style': {
                'background-color': '#1e1e1e',  # Dark color, adjust as needed
                'width': '100%',
                'height': '100%',
            }
        }
        self.app.layout = html.Div([
            cyto.Cytoscape(
                id='network-graph', 
                elements=[
                    {'data': {'id': agent.get_description_json()['name_uuid'], 'label': agent.get_description_json()['name']}} for agent in self.agent_network.get_agent_dictionary().values()
                ] + [
                    {'data': {'source': agent.get_description_json()['name_uuid'], 'target': recipient.get_description_json()['name_uuid']}} for agent in self.agent_network.get_agent_dictionary().values() for recipient in agent.recipients.values()
                ], 
                layout={'name': 'breadthfirst'}, 
                style={'width': '100%', 'height': '700px'},
                stylesheet=[edge_style, node_style, core_style],
            ),  # Define your network graph setup here
            # dcc.Interval(id='update-interval', interval=self.update_interval, n_intervals=0)
        ],
        style={'width': '100%', 'height': '100%', 'background-color': '#1e1e1e'})

    def setup_callbacks(self):
        pass
        # @self.app.callback(
        #     Output('network-graph', 'stylesheet'),
        #     [Input('update-interval', 'n_intervals')]
        # )
        # def update_graph_styles(n):
        #     # Function to check for new messages and active agents
        #     # and update styles accordingly
        #     new_stylesheet = ...  # Define new styles based on latest data
        #     return new_stylesheet

    def run(self, debug=True):
        self.app.run_server(debug=debug)

if __name__ == '__main__':
    visualizer = InteractionVisualizer()
    visualizer.run(debug=True)
