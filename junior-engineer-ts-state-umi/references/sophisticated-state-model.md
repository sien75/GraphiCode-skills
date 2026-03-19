# Sophisticated State

In frontend application development, it is sometimes necessary to encapsulate high logic density, multidimensional asynchronous operations, and long-period business states.

Below is an example of state management for a large file chunked upload manager using a direct `Subscription` class:

```md
# method
queryUploadQueue: () -> void
queryGlobalProgress: () -> void
queryTaskStatus: (taskId: string) -> void
addTasks: (files: File[]) -> void
startTask: (taskId: string) -> void
pauseTask: (taskId: string) -> void
cancelTask: (taskId: string) -> void

# event
taskProgress: (cb: (payload: TaskProgressPayload) -> void) -> void
taskStatusChange: (cb: (payload: TaskStatusChangePayload) -> void) -> void
allComplete: (cb: () -> void) -> void
queryUploadQueueSuccess: (cb: (tasks: UploadTask[]) -> void) -> void
queryGlobalProgressSuccess: (cb: (progress: number) -> void) -> void
queryTaskStatusSuccess: (cb: (status: TaskStatus) -> void) -> void

# resides-in
browser-storage

# description
This state manages a complex file upload queue, supporting breakpoint resume and concurrency control:
1. **State Maintenance**: Internally maintains a task list, where each task contains file information, a list of chunks, the index of completed chunks, and the current status (waiting, calculating MD5, uploading, paused, success, failure).
2. **Core Logic**:
    - **Flash Upload Verification**: Calculate file Hash before uploading and request the backend interface to determine if it already exists.
    - **Concurrency Control**: Control the number of chunks uploaded simultaneously (e.g., maximum 3 at a time) to avoid browser request blockage.
    - **Progress Aggregation**: Real-time calculation of the upload progress for that file and even the global progress based on the uploaded bytes of all chunks.
3. **Methods**:
    - `queryUploadQueue`: Publish all current upload tasks via `queryUploadQueueSuccess` event.
    - `queryGlobalProgress`: Publish the total progress percentage via `queryGlobalProgressSuccess` event.
    - `queryTaskStatus`: Publish the status of a specific task via `queryTaskStatusSuccess` event.
    - `addTasks`: Convert native File objects into internal Tasks and add them to the queue.
    - `startTask`: Start or resume a specific upload task.
    - `pauseTask` / `cancelTask`: Pause or cancel a specific task.
4. **Events**:
    - `taskProgress`: Triggered when the progress of a single task is updated.
    - `taskStatusChange`: Triggered when the status of a task changes.
    - `allComplete`: Triggered when all tasks finish.
```

```ts
import { Subscription, Status } from 'graphicode-utils';
import from types...

class UploadState extends Subscription implements Status {
  private queue: UploadTask[] = [];

  public override enable() {
    super.enable();
  }

  public override disable() {
    super.disable();
  }

  private calculateGlobalProgress(): number {
    if (this.queue.length === 0) return 0;
    const total = this.queue.reduce((sum, t) => sum + t.progress, 0);
    return total / this.queue.length;
  }

  public queryUploadQueue(
    tag: { key: string; value: string }
  ) {
    this._publish('queryUploadQueueSuccess', this.queue, tag.value);
  }

  public queryGlobalProgress(
    tag: { key: string; value: string }
  ) {
    this._publish('queryGlobalProgressSuccess', this.calculateGlobalProgress(), tag.value);
  }

  public queryTaskStatus(
    tag: { key: string; value: string },
    taskId: { key: string; value: string }
  ) {
    const status = this.queue.find(t => t.id === taskId.value)?.status;
    this._publish('queryTaskStatusSuccess', status, tag.value);
  }

  public addTasks(
    tag: { key: string; value: string },
    files: { key: string; value: File[] }
  ) {
    for (const file of files.value) {
      this.queue.push(/* wrap File into UploadTask */);
    }
  }

  public startTask(
    tag: { key: string; value: string },
    taskId: { key: string; value: string }
  ) {
    // 1. Find task, update status to 'uploading'
    // 2. Chunk the file, upload with concurrency control
    // 3. On each chunk success, update progress and publish event
    this._publish('taskProgress', { taskId: taskId.value, progress: 50 }, tag.value);
    this._publish('taskStatusChange', { taskId: taskId.value, status: 'uploading' }, tag.value);
  }

  public pauseTask(
    tag: { key: string; value: string },
    taskId: { key: string; value: string }
  ) {
    // pause logic
    this._publish('taskStatusChange', { taskId: taskId.value, status: 'paused' }, tag.value);
  }

  public cancelTask(
    tag: { key: string; value: string },
    taskId: { key: string; value: string }
  ) {
    this.queue = this.queue.filter(t => t.id !== taskId.value);
    this._publish('taskStatusChange', { taskId: taskId.value, status: 'cancelled' }, tag.value);
  }

  public on(eventName: string) {
    return this._subscribe(eventName);
  }
}

const uploadState = new UploadState();
export default uploadState;
```
