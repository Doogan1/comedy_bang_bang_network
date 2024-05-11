from django.core.management.base import BaseCommand
import networkx as nx
from visualizer.models import Episode, Character, Guest

class Command(BaseCommand):
    help = "Generates a co-appearance network of characters or guests and calculates positions using NetworkX"

    def add_arguments(self, parser):
        parser.add_argument('type', type=str, help='Type of network to build, either "characters" or "guests"')

    def handle(self, *args, **options):
        network_type = options['type']
        if network_type not in ['characters', 'guests']:
            raise ValueError("Type must be 'characters' or 'guests'")
        self.stdout.write(self.style.SUCCESS(f'Starting to build and position the network for {network_type}...'))
        G = self.create_coappearance_network(network_type)
        self.stdout.write(self.style.SUCCESS('Network and positions updated successfully.'))

    def create_coappearance_network(self, network_type):
        G = nx.Graph()

        # Choose the appropriate related_name based on network_type
        relation = 'characters' if network_type == 'characters' else 'guests'
        Model = Character if network_type == 'characters' else Guest

        # Add entities as nodes using their primary key as the node identifier
        for episode in Episode.objects.all().prefetch_related(relation):
            entities = list(getattr(episode, relation).all())
            for i in range(len(entities)):
                G.add_node(entities[i].id, name=entities[i].name)  # Add node with entity PK as identifier
                for j in range(i + 1, len(entities)):
                    if G.has_edge(entities[i].id, entities[j].id):
                        G[entities[i].id][entities[j].id]['weight'] += 1
                    else:
                        G.add_edge(entities[i].id, entities[j].id, weight=1)

        # Calculate and return component data
        return self.calculate_component_data(G)

    def calculate_component_data(self, G):
        components = []
        total_nodes = G.order()
        for i, component_nodes in enumerate(nx.connected_components(G)):
            subgraph = G.subgraph(component_nodes)
            positions = nx.spring_layout(subgraph)
            centralities = self.compute_centrality_measures(subgraph)
            component_data = {
                'nodes': [{
                    'id': node,
                    'name': subgraph.nodes[node]['name'],
                    'position': positions[node],
                    **centralities['node_data'][node]
                } for node in subgraph.nodes()],
                'edges': [{'source': u, 'target': v, 'weight': data['weight']} for u, v, data in subgraph.edges(data=True)],
                'size': len(component_nodes),
                'percentage': (len(component_nodes) / total_nodes) * 100
            }
            components.append(component_data)
        components.sort(key=lambda x: x['size'], reverse=True)
        return components

    def compute_centrality_measures(self, G):
        centralities = {
            'degree': nx.degree_centrality(G),
            'closeness': nx.closeness_centrality(G),
            'betweenness': nx.betweenness_centrality(G),
            'eigenvector': nx.eigenvector_centrality(G, max_iter=1000, tol=1e-06)
        }
        node_data = {node: {} for node in G.nodes()}
        for measure, values in centralities.items():
            for node, value in values.items():
                node_data[node][measure] = value
        return {'node_data': node_data}
