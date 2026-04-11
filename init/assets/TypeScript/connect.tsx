import React, { useEffect, useState } from 'react';
import Subscription from './Subscription';

/**
 * Connect a state instance to a React functional component.
 *
 * @param stateInstance - The state instance (extends Subscription)
 * @param className - The class name of state instance
 * @param WrappedComponent - The React functional component to wrap
 * @returns A new React component that requires no props
 */
export function connect<S extends Subscription>(
  stateInstance: S,
  className: string,
  WrappedComponent: React.FC<{ data: any; stateInstance: S }>
): React.FC {
  const ConnectedComponent: React.FC = () => {
    const [data, setData] = useState<any>({});

    useEffect(() => {
      // Subscribe to state change event FIRST to catch initial state
      const subscription = stateInstance
        .on(className + '.__stateChange')
        .subscribe((newState: any) => {
          setData((prevState: any) => ({ ...prevState, ...newState }));
          stateInstance._publish(className + '.__pageInit')
        });

      // Then fetch initial state
      stateInstance.getState();

      return () => {
        subscription.unsubscribe();
      };
    }, [stateInstance]);

    return <WrappedComponent data={data} stateInstance={stateInstance} />;
  };

  return ConnectedComponent;
}

export default connect;
