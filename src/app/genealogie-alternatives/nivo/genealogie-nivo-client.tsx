'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { hierarchy } from 'd3-hierarchy';
import { tree } from 'd3-hierarchy';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ToastProvider';
import { getErrorMessage } from '@/lib/errors/messages';
import { 
  useGenealogyForm, 
  useGenealogyData, 
  useGenealogyHistory,
  useGenealogyZoom,
  useGenealogyDimensions,
  useGenealogyTree,
  useGenealogyPositions,
  useGenealogyDrag,
  type TreeNode
} from '@/hooks';
import { GenealogyMenu } from '@/components/genealogy/GenealogyMenu';
import { GenealogyHeader } from '@/components/genealogy/GenealogyHeader';
import { MenuToggleButton } from '@/components/genealogy/MenuToggleButton';
import { TreeLinksRenderer } from '@/components/genealogy/TreeLinksRenderer';
import { TreeNodeRenderer } from '@/components/genealogy/TreeNodeRenderer';
import { 
  getDefaultImage, 
  canEdit, 
  identifyCouples, 
  createPartnerMap,
  groupChildrenByParents,
  resolveCollisions,
  type Position
} from '@/utils/genealogy-tree-utils';
import type { Person } from '@/types/genealogy';

type GenealogieNivoClientProps = {
  initialPersons: Person[];
};

const defaultMargin = { top: 16, left: 40, right: 40, bottom: 40 };

// Fonction pour créer un chemin vertical simple
const verticalLinkPath = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
  return `M${sourceX},${sourceY}V${targetY}H${targetX}`;
};

export function GenealogieNivoClient({ initialPersons }: GenealogieNivoClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [translate, setTranslate] = useState({ x: 400, y: 40 });
  const [svgBackgroundFill, setSvgBackgroundFill] = useState('#f9fafb');
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Détecter le thème pour le fond SVG
  useEffect(() => {
    const updateSvgBackground = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setSvgBackgroundFill(isDark ? '#111827' : '#f9fafb');
    };
    
    updateSvgBackground();
    
    // Observer les changements de classe sur l'élément html
    const observer = new MutationObserver(updateSvgBackground);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);
  
  const { user, isLoading: isAuthLoading } = useAuth({
    redirectIfUnauthenticated: true,
    redirectTo: '/',
  });
  
  const userStatus = user?.status || '';
  const isAdmin = userStatus === 'administrateur';
  const canEditUser = canEdit(userStatus);

  // Visibilité de la vue Nivo en fonction des cartes cochées sur l'accueil
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkVisibility = async () => {
      if (isAuthLoading) {
        return;
      }

      // Les administrateurs ont toujours accès à la vue
      if (isAdmin) {
        setIsAllowed(true);
        return;
      }

      try {
        const response = await fetch('/api/genealogie/card-visibility');
        if (!response.ok) {
          setIsAllowed(true);
          return;
        }

        const visibility = await response.json() as Record<string, boolean>;
        // Clé utilisée pour la carte Nivo sur la page d'accueil
        const allowed = visibility['genealogie-nivo'] !== false;
        setIsAllowed(allowed);
      } catch (error) {
        console.error('Erreur lors du chargement de la visibilité de la vue Nivo:', error);
        // En cas d'erreur réseau, on ne bloque pas l'accès
        setIsAllowed(true);
      }
    };

    checkVisibility();
  }, [isAdmin, isAuthLoading]);
  
  // Hooks personnalisés
  const {
    formData,
    isEditing,
    editingId,
    handleInputChange,
    handleImageUploadSuccess,
    resetForm,
    loadPersonIntoForm
  } = useGenealogyForm();
  
  const {
    persons,
    isRefreshing,
    refreshData,
    addPerson,
    updatePerson,
    deletePerson
  } = useGenealogyData(initialPersons, '/api/genealogie-alternatives');
  
  const {
    history,
    loadingHistory,
    historyOpen,
    toggleHistory
  } = useGenealogyHistory(isAdmin);
  
  const { zoomLevel, zoomIn, zoomOut } = useGenealogyZoom(1.0);
  const dimensions = useGenealogyDimensions(isMenuOpen);
  
  const {
    customPositions,
    setCustomPositions,
    isSaving,
    saveToLocalStorage,
    savePositionsToSupabase,
    loadPositions
  } = useGenealogyPositions('genealogy-node-positions-nivo', canEditUser);
  
  const {
    isDragging,
    draggedNodeId,
    handleMouseDown,
    handleNodeMouseDown
  } = useGenealogyDrag(
    svgRef,
    translate,
    (nodeId, position) => {
      setCustomPositions(prev => {
        const newMap = new Map(prev);
        newMap.set(nodeId, position);
        saveToLocalStorage(newMap);
        return newMap;
      });
    },
    setTranslate
  );
  
  const treeData = useGenealogyTree(persons);
  
  const root = useMemo(() => {
    if (!treeData) return null;
    return hierarchy<TreeNode>(treeData);
  }, [treeData]);

  const yMax = Math.max(1200, dimensions.height - defaultMargin.top - defaultMargin.bottom);
  const xMax = Math.max(800, dimensions.width - defaultMargin.left - defaultMargin.right);
  
  const treeLayout = useMemo(() => {
    const t = tree<TreeNode>();
    t.size([yMax, xMax]);
    t.separation((a, b) => {
      if (a.parent === b.parent) {
        return 1;
      }
      return 1.0 / (a.depth * 2 + 1);
    });
    return t;
  }, [yMax, xMax]);
  
  const treeRoot = useMemo(() => {
    if (!root) return null;
    return treeLayout(root);
  }, [treeLayout, root]);

  if (!isAdmin && isAllowed === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Chargement de la vue généalogique...</p>
      </div>
    );
  }

  if (!isAdmin && isAllowed === false) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Cette vue généalogique n&apos;est pas disponible.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Veuillez contacter un administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
          </p>
        </div>
      </div>
    );
  }

  const handleImageUploadError = (errorMessage: string) => {
    console.error("Upload error:", errorMessage);
    showToast(getErrorMessage('FILE_UPLOAD_FAILED'), 'error');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataCopy = { ...formData };
    if (!formDataCopy.nom && formDataCopy.pere) {
      const pereNode = persons.find(p => p.id === formDataCopy.pere);
      if (pereNode?.nom) {
        formDataCopy.nom = pereNode.nom;
      }
    }

    const newPerson: Person = {
      ...formDataCopy,
      id: crypto.randomUUID(),
      image: formDataCopy.image
    };

    const success = await addPerson(newPerson);
    if (success) {
      resetForm();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const updatedPerson: Person = {
      ...formData,
      id: editingId,
      image: formData.image || null,
      dateDeces: formData.dateDeces || null,
      mere: formData.mere || null,
      pere: formData.pere || null,
    };

    const success = await updatePerson(updatedPerson);
    if (success) {
      resetForm();
      setSelectedNodeId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deletePerson(id);
    if (success) {
      resetForm();
      setSelectedNodeId(null);
    }
  };

  const handleNodeClick = (node: TreeNode) => {
    if (node.id === 'root') return;
    const person = persons.find(p => p.id === node.id);
    if (person) {
      loadPersonIntoForm(person);
      setSelectedNodeId(node.id);
      setIsMenuOpen(true);
    }
  };

  const handleSaveAndGoHome = (e?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e?.preventDefault();
    savePositionsToSupabase(customPositions);
    router.push('/accueil');
  };

  const handleBackgroundClick = () => {
    resetForm();
    setSelectedNodeId(null);
  };

  const getImage = (node: TreeNode) => {
    return node.image || getDefaultImage(node.genre);
  };

  const selectedPerson = selectedNodeId ? persons.find(p => p.id === selectedNodeId) : null;
  const selectedNode = selectedPerson ? {
    name: `${selectedPerson.prenom} ${selectedPerson.nom}`,
    description: selectedPerson.description,
    dateNaissance: selectedPerson.dateNaissance,
    dateDeces: selectedPerson.dateDeces,
    image: selectedPerson.image
  } : null;

  if (!treeRoot || !treeData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucune donnée généalogique disponible</p>
        </div>
      </div>
    );
  }

  // Préparer les données pour le rendu
  const couplesMap = identifyCouples(persons);
  const partnerMap = createPartnerMap(couplesMap);
  const { childrenByCouple, singleParentChildren } = groupChildrenByParents(persons);
  
  const nodeWidth = 200;
  const nodeHeight = 100;
  const minSpacing = 30;
  const coupleSpacing = 50;
  
  const nodes = treeRoot.descendants().filter(n => n.data.id !== 'root');
  
  interface NodePosition {
    id: string;
    x: number;
    y: number;
    depth: number;
    node: typeof nodes[0];
  }
  
  const nodePositions: NodePosition[] = nodes.map(node => ({
    id: node.data.id,
    x: node.x || 0,
    y: node.y || 0,
    depth: node.depth,
    node: node
  }));
  
  // Résoudre les collisions
  resolveCollisions(nodePositions, nodeWidth, minSpacing, coupleSpacing, partnerMap);
  
  const positionMap = new Map<string, Position>();
  nodePositions.forEach(nodePos => {
    const customPos = customPositions.get(nodePos.id);
    positionMap.set(nodePos.id, customPos || { x: nodePos.x, y: nodePos.y });
  });

  return (
    <motion.div 
      className="w-screen h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <MenuToggleButton 
        isOpen={isMenuOpen} 
        onToggle={() => setIsMenuOpen(!isMenuOpen)} 
      />

      <GenealogyMenu
        isOpen={isMenuOpen}
        canEdit={canEditUser}
        isEditing={isEditing}
        historyOpen={historyOpen}
        loadingHistory={loadingHistory}
        history={history}
        formData={formData}
        persons={persons}
        editingId={editingId}
        selectedNode={selectedNode}
        onInputChange={handleInputChange}
        onImageUploadSuccess={handleImageUploadSuccess}
        onImageUploadError={handleImageUploadError}
        onSubmit={isEditing ? handleUpdate : handleSubmit}
        onCancel={resetForm}
        onDelete={handleDelete}
        onToggleHistory={isAdmin ? toggleHistory : undefined}
      />

      <motion.div 
        className={`flex-1 transition-all duration-300 ${isMenuOpen ? 'ml-96' : 'ml-0'}`}
        style={{ paddingTop: '0' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col h-full">
          {/* Header sticky en haut, toujours visible au scroll */}
          <div className="sticky top-0 z-10 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60">
            <GenealogyHeader
              title="Arbre Généalogique - Nivo"
              isRefreshing={isRefreshing}
              isSaving={isSaving}
              canEdit={canEditUser}
              hasPositions={customPositions.size > 0}
              zoomLevel={zoomLevel}
              onRefresh={refreshData}
              onSavePositions={() => savePositionsToSupabase(customPositions)}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onGoHome={handleSaveAndGoHome}
              isMenuOpen={isMenuOpen}
            />
          </div>

          {/* Zone scrollable contenant uniquement l'arbre, le header reste fixe */}
          <div
            className="flex-1 overflow-auto"
            style={{ paddingTop: '0' }}
            onClick={handleBackgroundClick}
          >
            {dimensions.width > 0 && dimensions.height > 0 && treeRoot && (
              <svg
                id="nivo-tree-svg"
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{ display: 'block', cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
              >
                <rect width="100%" height="100%" fill={svgBackgroundFill} />
                <g transform={`translate(${defaultMargin.left + translate.x},${defaultMargin.top + translate.y}) scale(${zoomLevel})`}>
                  <TreeLinksRenderer
                    persons={persons}
                    positionMap={positionMap}
                    nodeWidth={nodeWidth}
                    couplesMap={couplesMap}
                    childrenByCouple={childrenByCouple}
                    singleParentChildren={singleParentChildren}
                    linkPath={verticalLinkPath}
                    style="nivo"
                  />
                  
                  {treeRoot.descendants().map((node, i) => {
                    const nodeData = node.data;
                    if (nodeData.id === 'root') return null;
                    
                    const adjustedPosition = positionMap.get(nodeData.id);
                    const top = adjustedPosition?.y ?? node.y ?? 0;
                    const left = adjustedPosition?.x ?? node.x ?? 0;
                    
                    const isDead = !!nodeData.dateDeces;
                    const isSelected = selectedNodeId === nodeData.id;

                    return (
                      <TreeNodeRenderer
                        key={`node-${nodeData.id}-${i}`}
                        node={nodeData}
                        x={left}
                        y={top}
                        nodeWidth={nodeWidth}
                        nodeHeight={nodeHeight}
                        isDead={isDead}
                        isSelected={isSelected}
                        isDragging={isDragging}
                        canEdit={canEditUser}
                        draggedNodeId={draggedNodeId}
                        onNodeMouseDown={handleNodeMouseDown}
                        onNodeClick={handleNodeClick}
                        getImage={getImage}
                        style="nivo"
                      />
                    );
                  })}
                </g>
              </svg>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

