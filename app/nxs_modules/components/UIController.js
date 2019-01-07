// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import ConfirmModal from 'components/Modals/ConfirmModal';
import ErrorModal from 'components/Modals/ErrorModal';
import SuccessModal from 'components/Modals/SuccessModal';
import Notification from 'components/Notification';
import ModalContext from 'context/modal';

const newModalID = (function() {
  let counter = 1;
  return () => `modal-${counter++}`;
})();

const newNotifID = (function() {
  let counter = 1;
  return () => `notif-${counter++}`;
})();

const NotificationsComponent = styled.div({
  position: 'fixed',
  top: 20,
  left: 20,
  zIndex: 9002,
});

const Modals = ({ modals }) => (
  <>
    {modals.map(({ id, component: Comp, props }) => (
      <ModalContext.Provider key={id} value={id}>
        <Comp {...props} />
      </ModalContext.Provider>
    ))}
  </>
);

const Notifications = ({ notifications }) => (
  <NotificationsComponent>
    {notifications.map(({ id, type, content }, i) => (
      <Notification key={id} notifID={id} type={type} index={i}>
        {content}
      </Notification>
    ))}
  </NotificationsComponent>
);

// Store the only instance of UIController class
let singleton = null;
// Default state for modals, can be updated even before
// the UIController instance is created
const defaultModals = [];

// UIController is a SINGLETON class
export default class UIController extends Component {
  // For opening modals before the UIController instance is even created
  static openModal = (component, props) => {
    const modalID = newModalID();
    defaultModals.push({
      id: modalID,
      component,
      props,
    });
  };

  constructor(props) {
    super(props);

    // Ensure there are no other instances
    if (singleton) {
      throw new Error('Cannot have more than one instance of UIController!');
    }
    singleton = this;

    // Expose the public UI APIs
    UIController.openModal = this.openModal;
    UIController.closeModal = this.closeModal;
    UIController.openConfirmModal = this.openConfirmModal;
    UIController.openErrorModal = this.openErrorModal;
    UIController.openSuccessModal = this.openSuccessModal;

    UIController.showNotification = this.showNotification;
    UIController.hideNotification = this.hideNotification;
  }

  state = {
    modals: defaultModals,
    notifications: [],
  };

  openModal = (component, props) => {
    const modalID = newModalID();
    this.setState({
      modals: [
        ...this.state.modals,
        {
          id: modalID,
          component,
          props,
        },
      ],
    });
    return modalID;
  };

  closeModal = modalID => {
    const modals = [...this.state.modals];
    const index = modals.findIndex(m => m.id === modalID);
    if (index >= 0) {
      modals.splice(index, 1);
      this.setState({ modals });
      return true;
    }
    return false;
  };

  openConfirmModal = props => this.openModal(ConfirmModal, props);

  openErrorModal = props => this.openModal(ErrorModal, props);

  openSuccessModal = props => this.openModal(SuccessModal, props);

  showNotification = (content, type) => {
    const notifID = newNotifID();
    this.setState({
      notifications: [
        {
          id: notifID,
          type,
          content,
        },
        ...this.state.notifications,
      ],
    });
    return notifID;
  };

  hideNotification = notifID => {
    const notifications = [...this.state.notifications];
    const index = notifications.findIndex(n => n.id === notifID);
    if (index >= 0) {
      notifications.splice(index, 1);
      this.setState({ notifications });
      return true;
    }
    return false;
  };

  controller = {
    openModal: this.openModal,
    closeModal: this.closeModal,
    openConfirmModal: this.openConfirmModal,
    openErrorModal: this.openErrorModal,
    openSuccessModal: this.openSuccessModal,

    showNotification: this.showNotification,
    hideNotification: this.hideNotification,
  };

  render() {
    return (
      <>
        {this.props.children}
        <Modals modals={this.state.modals} />
        <Notifications notifications={this.state.notifications} />
      </>
    );
  }
}