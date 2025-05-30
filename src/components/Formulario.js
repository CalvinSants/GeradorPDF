import React, { useState } from 'react';
import StatusSelector from './StatusSelector';
import { generatePdf } from '../pdfGenerator';

const Formulario = () => {
  // --- CONSTANTES DE OPÇÕES --- (Boa prática definir fora para não recriar em cada render)
  const qaOptionsList = [
    'Calvin Santana dos Santos',
    'Ana Julia da Silva',
    'Roberto Carlos Almeida',
  ];

  const confidencialidadeOptionsList = [
    'Público',
    'Interno',
    'Confidencial',
    'Confidencial Restrito',
    'Secreto',
  ];

  // --- FUNÇÃO DE FORMATAÇÃO DE DATA ---
  const formatDateWithTime = () => {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // --- ESTADO INICIAL PARA UM STEP ---
  const createInitialStep = () => ({
    id: Date.now() + Math.random(), // ID mais único
    descricao: '',
    imagem: null,
    imagemPreview: null,
    status: 'espera',
    dataCriacao: formatDateWithTime(),
  });

  // --- ESTADO INICIAL PARA UM CENÁRIO ---
  const createInitialCenario = () => ({
    id: Date.now() + Math.random(), // ID mais único
    valor: '',
    steps: [createInitialStep()],
  });

  // --- ESTADOS DO FORMULÁRIO ---
  const [pbi, setPbi] = useState('');
  const [qa, setQa] = useState(qaOptionsList[0]); // Usa o primeiro da lista como padrão
  const [confidencialidade, setConfidencialidade] = useState(confidencialidadeOptionsList[0]); // Usa o primeiro da lista
  const [cenarios, setCenarios] = useState([createInitialCenario()]);


  // --- FUNÇÃO PARA LIMPAR O FORMULÁRIO ---
  const handleLimparFormulario = () => {
    setPbi('');
    setQa(qaOptionsList[0]); // Redefine para o primeiro QA da lista
    setConfidencialidade(confidencialidadeOptionsList[0]); // Redefine para a primeira opção de confidencialidade
    setCenarios([createInitialCenario()]); // Redefine para um cenário com um step inicial
    
    // Opcional: rolar para o topo do formulário
    window.scrollTo(0, 0);
  };


  // --- Funções para Cenários ---
  const handleAddCenario = () => {
    setCenarios([...cenarios, createInitialCenario()]);
  };

  const handleRemoveCenario = (cenarioId) => {
    setCenarios(cenarios.filter((c) => c.id !== cenarioId));
  };

  const handleCenarioChange = (cenarioId, value) => {
    setCenarios(
      cenarios.map((c) =>
        c.id === cenarioId ? { ...c, valor: value } : c
      )
    );
  };

  // --- Funções para Steps ---
  const handleAddStep = (cenarioId) => {
    setCenarios(
      cenarios.map((cenario) =>
        cenario.id === cenarioId
          ? {
              ...cenario,
              steps: [
                ...cenario.steps,
                createInitialStep(), // Usa a função para criar um novo step
              ],
            }
          : cenario
      )
    );
  };

  // ... (handleRemoveStep, handleStepChange, handleStepImageChange permanecem iguais) ...
  const handleRemoveStep = (cenarioId, stepId) => {
    setCenarios(
      cenarios.map((cenario) =>
        cenario.id === cenarioId
          ? {
              ...cenario,
              steps: cenario.steps.filter((step) => step.id !== stepId),
            }
          : cenario
      )
    );
  };

  const handleStepChange = (cenarioId, stepId, field, value) => {
    setCenarios(
      cenarios.map((cenario) =>
        cenario.id === cenarioId
          ? {
              ...cenario,
              steps: cenario.steps.map((step) =>
                step.id === stepId ? { ...step, [field]: value } : step
              ),
            }
          : cenario
      )
    );
  };

  const handleStepImageChange = (cenarioId, stepId, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCenarios(
          cenarios.map((cenario) =>
            cenario.id === cenarioId
              ? {
                  ...cenario,
                  steps: cenario.steps.map((step) =>
                    step.id === stepId
                      ? { ...step, imagem: file, imagemPreview: reader.result }
                      : step
                  ),
                }
              : cenario
          )
        );
      };
      reader.readAsDataURL(file);
    } else {
      setCenarios(
        cenarios.map((cenario) =>
          cenario.id === cenarioId
            ? {
                ...cenario,
                steps: cenario.steps.map((step) =>
                  step.id === stepId
                    ? { ...step, imagem: null, imagemPreview: null }
                    : step
                ),
              }
            : cenario
        )
      );
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      pbi,
      qa,
      confidencialidade,
      cenarios,
      logo1Path: '/assets/logo1_mock.png',
      logo2Path: '/assets/logo2_mock.png',
    };
    console.log('Dados do Formulário:', formData);
    generatePdf(formData);
  };

  return (
    <div className="form-container">
      <h1>Formulário de Teste e Evidências</h1>
      <form onSubmit={handleSubmit}>
        {/* PBI */}
        <div className="form-group">
          <label htmlFor="pbi">PBI (Product Backlog Item):</label>
          <input
            type="text"
            id="pbi"
            value={pbi}
            onChange={(e) => setPbi(e.target.value)}
            required
          />
        </div>

        {/* QA */}
        <div className="form-group">
          <label htmlFor="qa">QA Tester:</label>
          <select id="qa" value={qa} onChange={(e) => setQa(e.target.value)} required >
            {qaOptionsList.map((option) => ( <option key={option} value={option}> {option} </option> ))}
          </select>
        </div>

        {/* Confidencialidade */}
        <div className="form-group">
          <label htmlFor="confidencialidade">Nível de Confidencialidade:</label>
          <select id="confidencialidade" value={confidencialidade} onChange={(e) => setConfidencialidade(e.target.value)} required >
            {confidencialidadeOptionsList.map((option) => ( <option key={option} value={option}> {option} </option> ))}
          </select>
        </div>

        {/* ... (renderização dos cenários e steps permanece a mesma) ... */}
        <div className="form-group">
          <h2>Cenários de Teste</h2>
          {cenarios.map((cenario, cenarioIndex) => (
            <div key={cenario.id} className="dynamic-list-item scenario-item" style={{border: '1px dashed #007bff', padding: '15px', marginBottom: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>Cenário {cenarioIndex + 1}</h3>
                {cenarios.length > 1 && (
                  <button
                    type="button"
                    className="button-delete"
                    onClick={() => handleRemoveCenario(cenario.id)}
                  >
                    Excluir Cenário
                  </button>
                )}
              </div>
              <label htmlFor={`cenario-${cenario.id}`}>Descrição do Cenário:</label>
              <textarea
                id={`cenario-${cenario.id}`}
                value={cenario.valor}
                onChange={(e) => handleCenarioChange(cenario.id, e.target.value)}
                placeholder="Descreva o cenário de teste"
                style={{width: '100%', minHeight: '60px'}}
              />

              <div className="steps-container" style={{marginTop: '15px', marginLeft: '20px', borderLeft: '2px solid #ccc', paddingLeft: '15px'}}>
                <h4>Steps do Cenário {cenarioIndex + 1}</h4>
                {cenario.steps.map((step, stepIndex) => (
                  <div key={step.id} className="dynamic-list-item step-item" style={{backgroundColor: '#f0f0f0', marginBottom:'10px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h5>Step {stepIndex + 1}</h5>
                        {cenario.steps.length > 1 && (
                            <button
                            type="button"
                            className="button-delete"
                            style={{fontSize: '12px', padding: '5px 8px'}}
                            onClick={() => handleRemoveStep(cenario.id, step.id)}
                            >
                            Excluir Step
                            </button>
                        )}
                    </div>
                    <div className="form-group">
                      <label htmlFor={`step-desc-${step.id}`}>Descrição do Step:</label>
                      <textarea
                        id={`step-desc-${step.id}`}
                        value={step.descricao}
                        onChange={(e) => handleStepChange(cenario.id, step.id, 'descricao', e.target.value)}
                        placeholder="Descreva o passo"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`step-img-${step.id}`}>Imagem (Evidência):</label>
                      <input
                        type="file"
                        id={`step-img-${step.id}`}
                        accept="image/*"
                        // Importante: limpar o valor do input file ao limpar o formulário é complicado
                        // A melhor abordagem é resetar o estado da imagem e preview
                        // O input file em si não é facilmente resetado programaticamente por razões de segurança
                        onChange={(e) => handleStepImageChange(cenario.id, step.id, e.target.files[0])}
                      />
                      {step.imagemPreview && (
                        <img src={step.imagemPreview} alt={`Preview Step ${stepIndex + 1}`} style={{maxWidth: '150px', marginTop: '10px', display: 'block'}}/>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Status:</label>
                      <StatusSelector
                          value={step.status}
                          onChange={(newStatus) => handleStepChange(cenario.id, step.id, 'status', newStatus)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Data de Criação do Step:</label>
                      <input type="text" value={step.dataCriacao} readOnly disabled />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="button-santander"
                  style={{backgroundColor: '#CC0000', fontSize: '14px', padding: '8px 12px'}}
                  onClick={() => handleAddStep(cenario.id)}
                >
                  + Adicionar Step a este Cenário
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="button-santander" onClick={handleAddCenario} style={{backgroundColor: '#CC0000', marginTop: '10px'}}>
            + Adicionar Novo Cenário
          </button>
        </div>

        <hr style={{margin: '30px 0'}}/>

        {/* BOTÕES DE AÇÃO NO FINAL DO FORMULÁRIO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <button
            type="button" // Importante: type="button" para não submeter o formulário
            className="button-clear" // Usaremos esta classe para estilizar
            onClick={handleLimparFormulario}
          >
            Limpar Formulário
          </button>
          <button type="submit" className="button-santander" style={{backgroundColor: '#CC0000'}}>
            Gerar PDF com Evidências
          </button>
        </div>
      </form>
    </div>
  );
};

export default Formulario;