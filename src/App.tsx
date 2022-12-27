import  React, { useCallback } from 'react';
import IdleTimeOutHandler from './IdleTimeOutHandler';

export default function App() {
  const [isActive, setIsActive] = React.useState(true);
  console.log("🚀 ~ file: App.tsx:6 ~ App ~ isActive", isActive)
  const onActiveHandler = useCallback(() => {
    setIsActive(true);
  }, [])

  const onIdleHandler = useCallback(() => {
    //Call logout
    setIsActive(false);
  }, [])

  return (
    <React.Fragment>
      <h1>{isActive ? 'User is Active' : 'User logged out'}</h1>
      <IdleTimeOutHandler
        onActive={onActiveHandler}
        onIdle={onIdleHandler}
        timeOutInterval={10} // seconds
        countDownInterval = {15} // seconds
      />
    </React.Fragment>
  );
}
