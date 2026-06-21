import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function Login() {
  const emailId = useId();
  const passwordId = useId();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/login", formData);
      localStorage.setItem("auth_token", res.data.token);
      navigate("/admin");
    } catch (err) {
      setError("Login gagal. Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#e8e4e4] flex items-center justify-end relative overflow-hidden">
      {/* ========= LAYER 0: Dekorasi Ellipse di Kanan (di belakang panel putih) ========= */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {/* Gambar kiri */}
        <img
          className="absolute top-0 left-0 w-[40%] max-w-[582px] h-full object-cover opacity-40"
          alt=""
          aria-hidden="true"
          src="/images/asset/login/mask-group.svg"
        />

        {/* Ellipse 1 - pojok kanan atas */}
        <img
          className="absolute -top-[10%] -right-[5%] w-[55%] max-w-[800px] opacity-60"
          alt=""
          aria-hidden="true"
          src="/images/asset/login/ellipse-2.svg"
        />

        {/* Ellipse 2 - kanan tengah (nempel di belakang panel putih) */}
        <img
          className="absolute top-[40%] right-[15%] w-[45%] max-w-[650px] opacity-50"
          alt=""
          aria-hidden="true"
          src="/images/asset/login/ellipse-4.svg"
        />
      </div>

      {/* ========= LAYER 1: Panel Kanan Putih Rounded ========= */}
      <div className="absolute right-0 top-0 h-full w-[85%] md:w-[72%] bg-[#f5f2eb] rounded-l-[60px] shadow-[-7px_6px_6px_2px_#00000015] z-[1]" />

      {/* ========= LAYER 2: Ellipse di atas panel (biar muncul) ========= */}
      <div className="absolute inset-0 pointer-events-none select-none z-[2]">
        {/* Ellipse muncul di area kanan panel */}
        <img
          className="absolute top-[15%] right-[5%] w-[35%] max-w-[500px] opacity-30"
          alt=""
          aria-hidden="true"
          src="/images/asset/login/ellipse-2.svg"
        />
      </div>

      {/* ========= LAYER 3: Form Card ========= */}
      <div className="relative z-10 w-full max-w-[460px] mr-[5%] md:mr-[10%] lg:mr-[14%] px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-[#1a1a1a] text-3xl sm:text-4xl leading-tight">
            Hai, Selamat Datang!
          </h1>
          <p className="mt-3 text-[#555] text-sm sm:text-base leading-relaxed">
            Silakan login terlebih dahulu untuk melanjutkan, ya!
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white/30 backdrop-blur-xl rounded-[40px] p-8 sm:p-10 shadow-lg border border-white/40">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor={emailId}
                className="block text-[#1a1a1a] font-medium text-sm ml-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-0 rounded-[60px] backdrop-blur-[20px] backdrop-brightness-[100%] bg-[linear-gradient(90deg,rgba(255,255,255,0.5)_45%,rgba(255,255,255,0.2)_90%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[60px] before:[background:linear-gradient(90deg,rgba(255,255,255,1)_17%,rgba(255,255,255,0.5)_45%,rgba(255,255,255,0.4)_71%,rgba(0,0,0,0.15)_93%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:pointer-events-none" />
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="relative z-[2] w-full h-[56px] px-6 bg-transparent text-[#1a1a1a] font-medium text-base placeholder:text-[#00000025] outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor={passwordId}
                className="block text-[#1a1a1a] font-medium text-sm ml-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-0 rounded-[60px] backdrop-blur-[20px] backdrop-brightness-[100%] bg-[linear-gradient(90deg,rgba(255,255,255,0.5)_45%,rgba(255,255,255,0.2)_90%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[60px] before:[background:linear-gradient(90deg,rgba(255,255,255,1)_17%,rgba(255,255,255,0.5)_45%,rgba(255,255,255,0.4)_71%,rgba(0,0,0,0.15)_93%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:pointer-events-none" />
                <input
                  id={passwordId}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="relative z-[2] w-full h-[56px] px-6 bg-transparent text-[#1a1a1a] font-medium text-base placeholder:text-[#00000025] outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[56px] bg-[#fafafa] rounded-[60px] shadow-[1px_5px_12.7px_-5px_#cd5c5c40] font-medium text-[#1a1a1a] text-lg hover:bg-white hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 border border-white/50"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>

        {/* Kembali */}
        <p className="text-center text-sm text-[#888] mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-[#F25C54] hover:underline font-medium transition"
          >
            ← Kembali ke Beranda
          </button>
        </p>
      </div>
    </main>
  );
}