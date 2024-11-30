from django.db import models
import json
import datetime

class UpdateLog(models.Model):
    update_date = models.DateField(auto_now=True)

class CharacterComponent(models.Model):
    name = models.CharField(max_length=100)

class GuestComponent(models.Model):
    name = models.CharField(max_length=100)

class Guest(models.Model):
    name = models.CharField(max_length=255)
    position = models.TextField(blank=True, default='')
    component = models.ForeignKey(GuestComponent, on_delete=models.CASCADE)

    def set_position(self, x, y):
        self.position = json.dumps({'x': x, 'y': y})

    def get_position(self):
        return json.loads(self.position) if self.position else None

class Character(models.Model):
    name = models.CharField(max_length=255)
    actors = models.ManyToManyField(Guest, related_name='characters')
    position = models.TextField(blank=True, default='')
    component = models.ForeignKey(CharacterComponent, on_delete=models.CASCADE)

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

class ShortestPath(models.Model):
    start_node_guest = models.ForeignKey(Guest, related_name='start_node_guest', null=True, blank=True, on_delete=models.CASCADE)
    end_node_guest = models.ForeignKey(Guest, related_name='end_node_guest', null=True, blank=True, on_delete=models.CASCADE)
    start_node_character = models.ForeignKey(Character, related_name='start_node_character', null=True, blank=True, on_delete=models.CASCADE)
    end_node_character = models.ForeignKey(Character, related_name='end_node_character', null=True, blank=True, on_delete=models.CASCADE)
    path = models.JSONField()  # Store the path as a list of node IDs
    length = models.IntegerField()
