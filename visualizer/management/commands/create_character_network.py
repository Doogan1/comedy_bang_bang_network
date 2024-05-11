from django.core.management.base import BaseCommand
import networkx as nx
from visualizer.models import Episode, Character

class Command(BaseCommand):
    help = "Generates a co-appearance network of characters or guests and calculates positions using NetworkX"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to build and position the network...'))
        G = self.create_co_appearance_network()

        self.stdout.write(self.style.SUCCESS('Network and positions updated successfully.'))

    def create_co_appearance_network(self):
        G = nx.Graph()
        
        # Add characters as nodes using their primary key as the node identifier
        for episode in Episode.objects.all().prefetch_related('characters'):
            characters = list(episode.characters.all())
            for i in range(len(characters)):
                # Use character.id instead of character.name
                G.add_node(characters[i].id, name=characters[i].name)  # Add node with character PK as identifier
                for j in range(i + 1, len(characters)):
                    if G.has_edge(characters[i].id, characters[j].id):
                        G[characters[i].id][characters[j].id]['weight'] += 1
                    else:
                        G.add_edge(characters[i].id, characters[j].id, weight=1)

        # Dictionary to hold data for each component
        components = []
        total_nodes = G.order()

        # Get all connected components, compute spring layout for each
        for i, component_nodes in enumerate(nx.connected_components(G)):
            subgraph = G.subgraph(component_nodes)
            positions = nx.spring_layout(subgraph)
            centralities = self.compute_centrality_measures(subgraph)

            component_data = {
                'nodes': [{
                    'id': node,
                    'name': subgraph.nodes[node]['name'],  # Fetch name from graph node attribute
                    'position': positions[node],
                    **centralities['node_data'][node]
                } for node in subgraph.nodes()],
                'edges': [{'source': u, 'target': v, 'weight': data['weight']} for u, v, data in subgraph.edges(data=True)],
                'size': len(component_nodes),
                'percentage': (len(component_nodes) / total_nodes) * 100
            }
            components.append(component_data)

        # Sort components by size in descending order
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