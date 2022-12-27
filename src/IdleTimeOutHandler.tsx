import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface IdleTimeOutHandlerProps {
  onActive?: () => void;
  onIdle?: () => void;
  timeOutInterval: number;
  countDownInterval: number;
}
const IdleTimeOutHandler = ({
  onActive: parentActiveHandler = () => { },
  onIdle: parentIdlHandler = () => { },
  timeOutInterval = 5 * 60,
  countDownInterval = 1 * 60
}: IdleTimeOutHandlerProps) => {
  const [isIdle, setIsIdle] = useState(false);
  const [remainingTime, setRemainingTime] = useState();
  const worker = useRef<Worker>();
  const events = useMemo(() => ["click", "scroll", "load", "keydown"], []);

  const onActive = useCallback(() => {
    setIsIdle(false);
    parentActiveHandler();
  }, [])

  const onIdle = useCallback(() => {
    setIsIdle(true);
  }, [])

  const eventHandler = useCallback(() => {
    localStorage.setItem(
      "lastInteractionTime",
      JSON.stringify(new Date().valueOf())
    );
    worker.current?.postMessage({ key: "userInteracted" });
  }, []);

  const addEvents = useCallback(() => {
    events.forEach((eventName) => {
      window.addEventListener(eventName, eventHandler);
    });
  }, [eventHandler, events]);

  const removeEvents = useCallback(() => {
    events.forEach((eventName) => {
      window.removeEventListener(eventName, eventHandler);
    });
  }, [eventHandler, events])

  useEffect(() => {
    addEvents();
    const lastInteractionTimeString = localStorage.getItem("lastInteractionTime");
    const lastInteractionTime = lastInteractionTimeString ? Number(lastInteractionTimeString) : null;

    if (lastInteractionTime === null) {
      localStorage.setItem(
        "lastInteractionTime",
        JSON.stringify(new Date().valueOf())
      );
    }

    worker.current = new Worker('./timer-worker.js');
    worker.current?.postMessage({ key: "timeOutInterval", value: timeOutInterval });
    worker.current?.postMessage({ key: "countDownOutInterval", value: countDownInterval });
    worker.current?.postMessage({ key: "startTimer", value: lastInteractionTime });
    worker.current.onmessage = (e) => {
      if (e.data === 'onActive') {
        onActive();
      } else if (e.data === 'onIdle') {
        onIdle();
      } else if (e.data.indexOf('countDown:') > -1) {
        setRemainingTime(e.data.split('countDown:')[1]);
      } else if (e.data === 'countDownCompleted') {
        setIsIdle(false);
        localStorage.removeItem("lastInteractionTime");
        parentIdlHandler();
      } else if (e.data === 'updateLastInteractionTime') {
        const lastInteractionTimeString = localStorage.getItem("lastInteractionTime");
        const lastInteractionTime = lastInteractionTimeString ? Number(lastInteractionTimeString) : null;
        worker.current?.postMessage({ key: "lastInteractionTimeUpdated", value: lastInteractionTime });
      }
      else {
        console.log(e.data);
      }
    }

    return () => {
      removeEvents();
      worker.current?.terminate();
    };
  }, [addEvents, removeEvents, onActive, onIdle, timeOutInterval]);

  return <> {
    isIdle ? <Dialog
      open={true}
      onClose={eventHandler}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Session Timeout
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Due to user inactivity you will be logged out in {remainingTime}.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={eventHandler}>Keep me signed In</Button>
      </DialogActions>
    </Dialog> : null
  }
  </>
};

export default IdleTimeOutHandler;
