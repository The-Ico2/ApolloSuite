export default function TwitterLogin() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/api/twitter/login';
  };

  return (
    <button onClick={handleLogin}>
      Connect Twitter
    </button>
  );
}