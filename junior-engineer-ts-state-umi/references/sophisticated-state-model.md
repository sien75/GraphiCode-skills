# Sophisticated State Model

In frontend application development, it is sometimes necessary to encapsulate high logic density, multidimensional asynchronous operations, and long-period business states.

Below is an example of state management for a large file chunked upload manager:

```md
# read
## queryUploadQueue
UploadTask[]
## queryGlobalProgress
number
## queryTaskStatus
> string
TaskStatus

# write
## addTasks
> File[]
__null
## startTask
> string
__null
## pauseTask
> string
__null
## cancelTask
> string
__null

# event
## onTaskProgress
TaskProgressPayload
## onTaskStatusChange
TaskStatusChangePayload
## onAllComplete

# resides-in
browser-storage

# description
This state manages a complex file upload queue, supporting breakpoint resume and concurrency control:
1. **State Maintenance**: Internally maintains a task list, where each task contains file information, a list of chunks, the index of completed chunks, and the current status (waiting, calculating MD5, uploading, paused, success, failure).
2. **Core Logic**:
    - **Flash Upload Verification**: Calculate file Hash before uploading and request the backend interface to determine if it already exists.
    - **Concurrency Control**: Control the number of chunks uploaded simultaneously (e.g., maximum 3 at a time) to avoid browser request blockage.
    - **Progress Aggregation**: Real-time calculation of the upload progress for that file and even the global progress based on the uploaded bytes of all chunks.
3. **Read Operations (read)**:
    - `queryUploadQueue`: Get all current upload tasks and their snapshots.
    - `queryGlobalProgress`: Get the total progress percentage of all tasks.
4. **Write Operations (write)**:
    - `addTasks`: Convert native File objects into internal Tasks and add them to the queue.
    - `startTask`: Start or resume a specific upload task, internal logic will automatically handle chunking.
5. **Events (event)**:
    - `onTaskProgress`: Triggered when the progress of a single task is updated.
    - `onTaskStatusChange`: Triggered when the status of a task changes.
```

```ts
import { useState, useRef, useCallback, useMemo } from 'react';
import { reactToState, SubscriptionWithSetter, Status } from './state';
import from types...

/**
 * Custom Hook: Implements the core scheduling logic for file uploading
 */
export function useUploadManager(id: string) {
  const [queue, setQueue] = useState<UploadTask[]>([]);

  // Calculate global progress
  const globalProgress = useMemo(() => {
    // Aggregate and calculate a total percentage based on the progress of each task in the queue
    return calculateTotal(queue);
  }, [queue]);

  // Write operation: Add tasks
  const addTasks = useCallback((files: File[]) => {
    // Wrap File objects into UploadTask structures and update the queue
  }, []);

  // Write operation: Execute upload logic
  const startTask = useCallback(async (taskId: string) => {
    // 1. Update task status to 'calculating' (MD5 sample verification)
    // 2. Call the backend interface for "flash upload" judgment
    // 3. If not a flash upload, enter the 'uploading' state
    // 4. Execute "chunking logic": Cut the file Blob and call the upload interface through concurrency control (e.g., p-limit)
    // 5. After each chunk is successfully uploaded, update task progress and trigger an event
    stateInstance._publish('onTaskProgress', { taskId, progress: 50 });
  }, [queue]);

  // Utilize the bridge Hook to synchronize with the external State instance
  reactToState.useCapture(id,
    { queue, globalProgress }, // The data here will map to State properties (for read use)
    { addTasks, startTask, pauseTask: (id) => {}, cancelTask: (id) => {} } // The methods here map to State write methods
  );

  return { queue, globalProgress, addTasks, startTask };
}

/**
 * State Class: Interface layer for Flow execution
 */
class UploadState extends SubscriptionWithSetter implements Status {
  private queue: UploadTask[] = [];
  private globalProgress: number = 0;

  // Method placeholders (populated by useCapture)
  public addTasks: (files: File[]) => void;
  public startTask: (id: string) => void;
  public pauseTask: (id: string) => void;
  public cancelTask: (id: string) => void;

  public queryUploadQueue(): UploadTask[] {
    return this.queue;
  }

  public queryGlobalProgress(): number {
    return this.globalProgress;
  }

  public onTaskProgress(id: string, callback: (data: any) => void) {
    this._subscribe(id, 'onTaskProgress', callback);
  }

  public onTaskStatusChange(id: string, callback: (data: any) => void) {
    this._subscribe(id, 'onTaskStatusChange', callback);
  }

  public onAllComplete(id: string, callback: () => void) {
    this._subscribe(id, 'onAllComplete', callback);
  }
}

const uploadState = new UploadState();
reactToState.setState('UploadManagerModel', uploadState);
export { uploadState };
```

Note 1:

Only within State corresponding to React functional components and hooks, **the callback of `this._subscribe` can receive two parameters**, namely the current value and the previous value.
