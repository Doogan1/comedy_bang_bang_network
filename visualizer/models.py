from django.db import models
import json
import datetime

class Node(models.Model):
    name = models.CharField(max_length=100)
    attributes = models.JSONField(default=dict)

class Edge(models.Model):
    source = models.ForeignKey(Node, related_name='outgoing_edges', on_delete=models.CASCADE)
    target = models.ForeignKey(Node, related_name='incoming_edges', on_delete=models.CASCADE)
    weight = models.FloatField(default=1.0)



class Guest(models.Model):
    name = models.CharField(max_length=255)
    position = models.TextField(blank=True, default='')

    def set_position(self, x, y):
        self.position = json.dumps({'x': x, 'y': y})

    def get_position(self):
        return json.loads(self.position) if self.position else None

class Character(models.Model):
    name = models.CharField(max_length=255)
    actors = models.ManyToManyField(Guest, related_name='characters')
    position = models.TextField(blank=True, default='')

    def set_position(self, x, y):
        self.position = json.dumps({'x': x, 'y': y})

    def get_position(self):
        return json.loads(self.position) if self.position else None

class Episode(models.Model):
    title = models.CharField(max_length=255)
    number = models.CharField(max_length=255)
    release_date = models.CharField(max_length=255)
    characters = models.ManyToManyField(Character, related_name='episodes')
    guests = models.ManyToManyField(Guest, related_name='episodes')
