class PipelineStep:
    def execute(self, context):
        """Execute the step."""
        raise NotImplementedError("Subclasses must implement this method.")

class Pipeline:
    def __init__(self, name):
        self.name = name
        self.steps = []

    def add_step(self, step):
        self.steps.append(step)

    def execute(self):
        context = {}
        print(f"Executing pipeline: {self.name}")
        for step in self.steps:
            step.execute(context)
