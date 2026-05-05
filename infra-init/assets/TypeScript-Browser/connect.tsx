/**
 * Connects a browser-DOM state instance to a React functional component.
 *
 * The typical pattern for a browser-DOM page module:
 *
 * 1. Define a State class that manages page data and publishes `__stateChange` events:
 *
 *   import State from '@/graphicode-utils/State';
 *   import { curried, guardEnabled } from '@/graphicode-utils/state-decorators';
 *
 *   export class LoginState extends State {
 *     private currentScene: string = 'loginPage';
 *     private email: string = '';
 *     private error: { message: string } | null = null;
 *
 *     @guardEnabled
 *     @curried
 *     public showScene(scene: string) {
 *       this.currentScene = scene;
 *       this._publish('LoginState.__stateChange', { currentScene: scene });
 *     }
 *
 *     @guardEnabled
 *     @curried
 *     public showError(error: { message: string }) {
 *       this.error = error;
 *       this._publish('LoginState.__stateChange', { error });
 *     }
 *
 *     public getState() {
 *       return { currentScene: this.currentScene, email: this.email, error: this.error };
 *     }
 *   }
 *
 * 2. Create the state instance, export class and instance with specific and generic names:
 *
 *   const loginState = new LoginState();
 *   loginState.enable();
 *   export { LoginState, loginState };
 *   export { LoginState as TheClass, loginState as theInstance };
 *   export const stateChangeEventName = 'LoginState.__stateChange';
 *
 * 3. Write the React component that receives `data` and `stateInstance` as props:
 *
 *   const Login: React.FC<{ data: any; stateInstance: LoginState }> = ({ data, stateInstance }) => {
 *     useEffect(() => { stateInstance._publish('Login.init'); }, []);
 *     return (
 *       <div>
 *         {data.currentScene === 'loginPage' && <LoginPage data={data} stateInstance={stateInstance} />}
 *         {data.currentScene === 'otp' && <OtpPage data={data} stateInstance={stateInstance} />}
 *       </div>
 *     );
 *   };
 *
 * 4. Connect them together and export as default:
 *
 *   import { connect } from '@/graphicode-utils';
 *
 *   const LoginWithState = connect(loginState, 'LoginState', Login);
 *   export default LoginWithState;
 *
 * The connected component:
 * - Subscribes to `LoginState.__stateChange` and re-renders on every state update
 * - Merges published partial state into the full state (shallow merge)
 * - Publishes `LoginState.__pageInit` after each state change
 * - Loads initial state via `getState()` on mount
 * - Passes `data` (merged state) and `stateInstance` as props to the wrapped component
 * - Unsubscribes on unmount
 *
 * @param stateInstance - The state instance (extends State)
 * @param className - The class name of the state (used for event names, e.g. 'LoginState')
 * @param WrappedComponent - The React functional component to wrap, receives { data, stateInstance }
 * @returns A new React component that requires no props
 */

import React, { useEffect, useState } from 'react';
import State from './State';
export function connect<S extends State>(
  stateInstance: S,
  className: string,
  WrappedComponent: React.FC<{ data: any; stateInstance: S; children?: React.ReactNode }>,
): React.FC<{ children?: React.ReactNode }> {
  const ConnectedComponent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<any>({});

    useEffect(() => {
      // Subscribe to state change event FIRST to catch initial state
      const subscription = stateInstance
        .on(className + '.__stateChange')
        .subscribe((newState: any) => {
          setData((prevState: any) => ({ ...prevState, ...newState }));
          stateInstance._publish(className + '.__pageInit');
        });

      // Then fetch initial state
      const initialState = stateInstance.getState();
      if (initialState) {
        setData(initialState);
      }

      return () => {
        subscription.unsubscribe();
      };
    }, [stateInstance]);

    return <WrappedComponent data={data} stateInstance={stateInstance}>{children}</WrappedComponent>;
  };

  return ConnectedComponent;
}

export default connect;
