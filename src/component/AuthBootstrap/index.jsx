import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getMeAPI } from "api/auth";
import {
  clearAuth,
  setAuthBootstrapped,
  setAuthenticatedUser,
} from "../../redux/authSlice";
import { clearAdminSession } from "utils/adminAuth";
import { SESSION_KEYS } from "utils/constant";
import { removeSessionItem } from "utils/session";
import { clearUserSession } from "utils/userAuth";

const AuthBootstrap = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    clearUserSession();
    clearAdminSession();
    removeSessionItem(SESSION_KEYS.LAST_ORDER_SUCCESS);

    const bootstrap = async () => {
      try {
        const response = await getMeAPI();

        if (isMounted) {
          dispatch(setAuthenticatedUser(response.user || response));
        }
      } catch (error) {
        if (isMounted) {
          dispatch(clearAuth());
        }
      } finally {
        if (isMounted) {
          dispatch(setAuthBootstrapped(true));
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return null;
};

export default AuthBootstrap;
