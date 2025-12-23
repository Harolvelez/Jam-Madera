import { Navigate, Outlet } from "react-router-dom";
import { canAccess } from "../utils/auth";

type Props = {
  allowedRoles: number[];
};

export default function RoleGuard({ allowedRoles }: Props) {
  if (!canAccess(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
