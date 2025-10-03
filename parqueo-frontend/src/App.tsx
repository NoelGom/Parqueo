import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ResourcePage from "./pages/ResourcePage";
import ParqueoDetail from "./pages/ParqueoDetail";
import { resources } from "./resources/resourcesConfig";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />

        {resources.map((r) => (
          <Route key={r.key} path={`/${r.key}`} element={<ResourcePage res={r} />} />
        ))}
        {resources.map((r) => (
          <Route key={`${r.key}-new`} path={`/${r.key}/nuevo`} element={<ResourcePage res={r} mode="create" />} />
        ))}
        {resources.map((r) => (
          <Route key={`${r.key}-edit`} path={`/${r.key}/:id`} element={<ResourcePage res={r} mode="edit" />} />
        ))}

        {/* Mapa de espacios por parqueo */}
        <Route path="/parqueos/:id/espacios" element={<ParqueoDetail />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
