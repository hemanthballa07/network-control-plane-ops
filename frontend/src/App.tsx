import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NodeList from './pages/NodeList';
import NodeDetail from './pages/NodeDetail';
import Topology from './pages/Topology';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<NodeList />} />
          <Route path="/nodes/:id" element={<NodeDetail />} />
          <Route path="/topology" element={<Topology />} />
          <Route path="/settings" element={<div className="text-slate-400">Settings not implemented yet.</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
