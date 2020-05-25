import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default class ConfirmButton extends React.Component {
  state = {
    isOpen: false,
  };

  setOpen(isOpen) {
    this.setState({ isOpen });
  }

  render() {
    const {
      component = Button,
      children,
      message,
      description,
      onConfirm,
      ...props
    } = this.props;

    const open = () => {
      this.setOpen(true);
    };

    const close = () => {
      this.setOpen(false);
    };

    const confirm = () => {
      this.setOpen(false);
      onConfirm();
    };

    const { isOpen } = this.state;

    return (
      <>
        {React.createElement(component, {
          ...props,
          children,
          onClick: open,
        })}
        {isOpen && (
          <Dialog
            open={isOpen}
            onClose={close}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{message}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {description}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                data-testid="confirm-button-no"
                onClick={close}
                color="primary"
              >
                No
              </Button>
              <Button
                data-testid="confirm-button-yes"
                onClick={confirm}
                color="primary"
                autoFocus
              >
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  }
}
