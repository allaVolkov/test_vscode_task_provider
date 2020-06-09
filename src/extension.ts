import * as vscode from 'vscode';
import { TaskDefinition, TaskProvider, Task, ShellExecution, tasks, Disposable, commands, workspace, TaskScope, ConfigurationTarget } from 'vscode';

let taskProvider: Disposable | undefined;
let command1: Disposable | undefined;
let command2: Disposable | undefined;

interface TestTaskDefinition extends TaskDefinition {
    label: string;
    prop1: string;
}

class TestTaskProvider implements TaskProvider {
    provideTasks(): Task[] {
        const taskDef = { type: "test-task-provider", label: "testQA", prop1: "value1" };
        const task = this.createTask(taskDef, "echo [${command:testCommand1}]");

        return [task];
    }

    resolveTask(task: vscode.Task): vscode.ProviderResult<vscode.Task> {
        if (task.definition.type !== "test-task-provider") {
            return undefined;
        }
        const taskDef = task.definition as TestTaskDefinition;
        return this.createTask(taskDef, "echo [${command:testCommand2}]");
    }

    private createTask(taskDefinition: TestTaskDefinition, command: string): Task {
        const folders = workspace.workspaceFolders;
        const scope = folders ? folders[0] : TaskScope.Workspace;
        return new Task(
            taskDefinition,
            scope,
            taskDefinition.label,
            "test-task-provider",
            new ShellExecution(command, { cwd: "." }),
            []
        );
    }
}

export function activate(context: vscode.ExtensionContext) {

    taskProvider = tasks.registerTaskProvider(
        "test-task-provider",
        new TestTaskProvider()
    );

    command1 = commands.registerCommand(
        "testCommand1",
        async function (): Promise<string> {
            return "command1-Output";
        }
    );

    command2 = commands.registerCommand(
        "testCommand2",
        async function (): Promise<string> {
            return "command2-Output";
        }
    );
}

export function deactivate() {
    if (taskProvider) {
        taskProvider.dispose();
    }
    if (command1) {
        command1.dispose();
    }
    if (command2) {
        command2.dispose();
    }
}
