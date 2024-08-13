import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";


type UseLogoutReturn = {
    handleLogout: () => Promise<void>;
    isLoggingOut: boolean;
    error: Error | undefined;
};

const useLogout = (): UseLogoutReturn => {
    const [signOut, isLoggingOut, error] = useSignOut(auth);
    const router=useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push("/login");
            localStorage.removeItem("user-info")
        } catch (error: any) {
            console.log("Error logging out:", error);
        }
    };

    return { handleLogout, isLoggingOut, error };
};

export default useLogout;
