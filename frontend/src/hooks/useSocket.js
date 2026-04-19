import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useSocket(userId, onNotification) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("join", userId);

    ["new_assignment", "status_update", "complaint_resolved", "new_complaint"].forEach(
      (eventName) => {
        socketRef.current.on(eventName, (data) => {
          onNotification({ ...data, type: eventName });
        });
      }
    );

    return () => socketRef.current?.disconnect();
  }, [userId, onNotification]);
}
