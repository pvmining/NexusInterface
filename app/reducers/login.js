import * as TYPE from "../actions/actiontypes";

const initialState = {
  unlockUntillDate: "",
  accoutName: "",
  privKey: "",
  address: "",
  errorMessage: "Password is required"
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_DATE:
      return {
        ...state,
        unlockUntillDate: action.payload
      };
      break;
    case TYPE.SET_ERROR_MESSAGE:
      return {
        ...state,
        errorMessage: action.payload
      };
      break;
    case TYPE.WIPE_LOGIN_INFO:
      return initialState;
      break;
    default:
      return state;
  }
};