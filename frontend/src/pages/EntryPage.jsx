import { useNavigate } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";

const EntryPage = () => {
    const navigate = useNavigate();

    const handleGuest = async () => {
        try {
            const res = await api.post("/auth/guest");
            localStorage.setItem("accessToken", res.data.accessToken);
            navigate("/", { replace: true });
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Guest login failed");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card bg-base-100 w-full max-w-md shadow">
                <div className="card-body text-center space-y-4">
                    <h1 className="text-2xl font-bold">ThinkBoard</h1>
                    <p className="text-base-content/70">
                        Create notes instantly. No signup required.
                    </p>

                    <button className="btn btn-primary w-full" onClick={handleGuest}>
                        Continue as Guest
                    </button>

                    {/* 下面这两个按钮你之后再实现 */}
                    <button className="btn btn-outline w-full" disabled>
                        Sign up (coming soon)
                    </button>
                    <button className="btn btn-ghost w-full" disabled>
                        Log in (coming soon)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EntryPage;
