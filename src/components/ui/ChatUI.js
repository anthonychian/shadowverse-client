import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import ChatIcon from "@mui/icons-material/Chat";
import { Snackbar, IconButton, SnackbarContent } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const reduxChatLog = useSelector((state) => state.card.chatLog);
  const reduxLastChatMessage = useSelector(
    (state) => state.card.lastChatMessage
  );

  useEffect(() => {
    if (reduxLastChatMessage !== "") setOpenSnack(true);
  }, [reduxLastChatMessage]);

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

  const handleCloseSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnack}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {reduxLastChatMessage !== "" && !open && (
        <Snackbar
          open={openSnack}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          autoHideDuration={6000}
          onClose={handleCloseSnack}
          // message={reduxLastChatMessage}
          // action={action}
        >
          <SnackbarContent
            style={{
              backgroundColor: "white",
              color: "black",
            }}
            message={<span id="client-snackbar">{reduxLastChatMessage}</span>}
            action={action}
          />
        </Snackbar>
      )}
      <Button variant="outlined" onClick={handleClick}>
        <ChatIcon sx={{ color: "white" }} />
      </Button>
      <Dialog
        PaperProps={{ style: { pointerEvents: "auto" } }}
        disableEnforceFocus
        style={{
          pointerEvents: "none",
        }}
        hideBackdrop
        open={open}
        onClose={handleClick}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          Chat
        </DialogTitle>
        <DialogContent
          style={{
            height: "150px",
            width: "300px",
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
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
