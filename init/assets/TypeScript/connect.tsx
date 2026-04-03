import React, { useEffect, useState } from 'react';
import Subscription from './Subscription';

/**
 * Connect a state instance to a React functional component.
 *
 * @param stateInstance - The state instance (extends Subscription)
 * @param eventName - The event name to listen for state changes
 * @param WrappedComponent - The React functional component to wrap
 * @returns A new React component that requires no props
 */
export function connect<S extends Subscription>(
  stateInstance: S,
  eventName: string,
  WrappedComponent: React.FC<{ data: any; stateInstance: S }>
): React.FC {
  const ConnectedComponent: React.FC = () => {
    const [data, setData] = useState<any>({});

    useEffect(() => {
      // Initial state fetch
      stateInstance.getState({ key: 'tag', value: eventName });

      // Subscribe to state change event to get full state updates
      const subscription = stateInstance
        .on(eventName)
        .subscribe((newState: any) => {
          setData((prevState: any) => ({ ...prevState, ...newState }));
        });

      return () => {
        subscription.unsubscribe();
      };
    }, [stateInstance, eventName]);

    return <WrappedComponent data={data} stateInstance={stateInstance} />;
  };

  return ConnectedComponent;
}

export default connect;
