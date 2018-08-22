import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.login
  };
};

const mapDispatchToProps = dispatch => ({
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: () => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG })
});

class Security extends Component {
  lockWallet() {
    this.props.busy();
    RPC.PROMISE("walletlock", []).then(payload => {
      this.props.wipe();
      this.props.busy();
    });
  }
  showPrivKey(e) {
    e.preventDefault();
    let addressInput = document.getElementById("privKeyAddress");
    let address = addressInput.value;
    let output = document.getElementById("privKeyOutput");
    if (address) {
      RPC.PROMISE("dumpprivkey", [address]).then(payload => {
        output.value = payload;
      });
    } else {
      addressInput.focus();
    }
  }

  importPrivKey(e) {
    e.preventDefault();
    let acctname = document.getElementById("acctName");
    let label = acctname.value.trim();
    let privateKeyInput = document.getElementById("privateKey");
    let pk = privateKeyInput.value.trim();

    if (label && pk) {
      RPC.PROMISE("importprivkey", [pk], [label]).then(payload => {
        RPC.GET("rescan");
      });
    } else if (!label) {
      acctname.focus();
    } else if (!pk) {
      privateKeyInput.focus();
    }
  }

  copyPrivkey(e) {
    e.preventDefault();
    let output = document.getElementById("privKeyOutput");
    output.type = "text";
    output.focus();
    output.select();
    document.execCommand("Copy", false, null);
    output.type = "password";
  }

  changePassword(e) {
    e.preventDefault();
    let pass, newPass, passChk, passHint;
    pass = document.getElementById("oldPass");
    newPass = document.getElementById("newPass");
    passChk = document.getElementById("passChk");
    passHint = document.getElementById("passHint");
    if (pass.value.trim()) {
      if (newPass.value === passChk.value) {
        if (!(newPass.value.endsWith(" ") || newPass.value.startsWith(" "))) {
          RPC.PROMISE("walletpassphrasechange", [
            pass.value,
            newPass.value
          ]).then(payload => {
            if (payload === null) {
              pass.value = "";
              newPass.value = "";
              passChk.value = "";
              alert("Password has been changed.");
            }
          });
        } else {
          passChk.value = "";
          passHint.innerText = "Password cannot start or end with spaces";
          passChk.focus();
        }
      } else {
        passChk.value = "";
        passHint.innerText = "Passwords do not match";
        passChk.focus();
      }
    } else {
      passHint.innerText = "Passwords do not match";
      pass.focus();
    }
  }

  reEnterValidator(e) {
    let newPass = document.getElementById("newPass");
    let passHint = document.getElementById("passHint");
    if (e.target.value === newPass.value) {
      e.preventDefault();
      passHint.style.visibility = "hidden";
    } else {
      passHint.style.visibility = "visible";
    }
  }

  componentWillUnmount() {
    this.props.wipe();
  }
  render() {
    if (!this.props.loggedIn) {
      return (
        <Redirect to={this.props.match.path.replace("/Content", "/Security")} />
      );
    }
    return (
      <div id="securitylogin">
        <div className="securitySubContainer">
          <form>
            <fieldset>
              <legend>Change Password</legend>
              <div className="field">
                <label>Previous Password:</label>
                <input
                  type="password"
                  placeholder="Password"
                  id="oldPass"
                  required
                />
                <span className="hint">Password is required</span>
              </div>
              <div className="field">
                <label>New Password:</label>
                <input
                  type="password"
                  placeholder="New Password"
                  id="newPass"
                  required
                />
                <span className="hint">New password is required</span>
              </div>
              <div className="field">
                <label>Re-Enter Password:</label>
                <input
                  type="password"
                  placeholder="Re-Enter Password"
                  id="passChk"
                  onChange={e => this.reEnterValidator(e)}
                />
                <span id="passHint" className="err invalid">
                  Passwords do not match
                </span>
              </div>
              <p>
                <button
                  style={{ width: "100%", margin: "0" }}
                  disabled={this.props.busyFlag}
                  className="button primary"
                  onClick={() => this.changePassword(e)}
                >
                  Submit
                </button>
              </p>
            </fieldset>
          </form>
          <button
            style={{ width: "100%", margin: "0" }}
            id="lockWallet"
            className="button default"
            // disabled={this.props.busyFlag}
            onClick={e => {
              e.preventDefault();
              this.lockWallet();
            }}
          >
            Lock Wallet
          </button>
        </div>
        <div className="securitySubContainer privKey">
          <form>
            <fieldset>
              <legend>View private key for address</legend>

              <div className="field">
                <label>Address:</label>
                <div className="expander">
                  <input
                    type="text"
                    id="privKeyAddress"
                    placeholder="Enter Address Here"
                    required
                  />
                  <button
                    // disabled={this.props.busyFlag}
                    className="button primary"
                    onClick={e => this.showPrivKey(e)}
                  >
                    Submit
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Private Key:</label>
                <div className="expander">
                  <input type="password" id="privKeyOutput" />
                  <button
                    // disabled={this.props.busyFlag}
                    className="button"
                    onClick={e => this.copyPrivkey(e)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
        <div className="securitySubContainer privKey">
          <form>
            <fieldset>
              <legend>Import Private Key</legend>
              <div className="field">
                <label>Account Name:</label>
                <div className="expander">
                  <input
                    type="Text"
                    placeholder="Account Name"
                    id="acctName"
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>Private Key:</label>
                <div className="expander">
                  <input
                    type="password"
                    placeholder="Private Key"
                    id="privateKey"
                    required
                  />
                </div>
              </div>
              <p>
                <button
                  disabled={this.props.busyFlag}
                  className="button primary"
                  onClick={e => this.importPrivKey(e)}
                >
                  Submit
                </button>
              </p>
            </fieldset>
          </form>
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Security);