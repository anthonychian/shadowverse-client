import React, { useState } from "react";
import Draggable from "react-draggable";
import ChatIcon from "@mui/icons-material/Chat";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setChat } from "../../redux/CardSlice";
function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export default function ChatUI() {
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();

  const reduxChatLog = useSelector((state) => state.card.chatLog);
  const [chatMessage, setChatMessage] = useState("");
  const handleClick = () => {
    setOpen(!open);
  };
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.value !== "") {
      dispatch(setChat(e.target.value));
      setChatMessage("");
    }
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClick}>
        <ChatIcon sx={{ color: "white" }} />
      </Button>
      <Dialog
        PaperProps={{ style: { pointerEvents: "auto" } }}
        // disableEnforceFocus
        style={{ pointerEvents: "none" }}
        hideBackdrop
        open={open}
        onClose={handleClick}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          Chat
        </DialogTitle>
        <DialogContent style={{ height: "150px", width: "300px" }}>
          <DialogContentText>
            {reduxChatLog.map((x) =>
              x[9] === "M" ? (
                <Typography
                  variant="body1"
                  style={{ color: "red", whiteSpace: "pre-line" }}
                >
                  {x}
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  style={{ color: "blue", whiteSpace: "pre-line" }}
                >
                  {x}
                </Typography>
              )
            )}
          </DialogContentText>
        </DialogContent>
        {/* <DialogActions>
          <Button autoFocus onClick={handleClick}>
            Cancel
          </Button>
          <Button onClick={handleClick}>Subscribe</Button>
        </DialogActions> */}

        <TextField
          style={{ padding: "1em" }}
          id="fullWidth"
          inputProps={{ maxLength: 50 }}
          value={chatMessage}
          onChange={(e) => {
            setChatMessage(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleChange(e);
          }}
        />
      </Dialog>
    </React.Fragment>
  );
}
