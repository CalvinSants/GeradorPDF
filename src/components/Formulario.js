import React, { useState } from 'react';
import StatusSelector from './StatusSelector';
import { generatePdf } from '../pdfGenerator';

const Formulario = () => {
  const [pbi, setPbi] = useState('');
  const [qa, setQa] = useState('Calvin Santana dos Santos');
  const [confidencialidade, setConfidencialidade] = useState('Público');

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

  const [cenarios, setCenarios] = useState([
    {
      id: Date.now(),
      valor: '',
      steps: [
        {
          id: Date.now() + 1,
          descricao: '',
          imagem: null,
          imagemPreview: null,
          status: 'espera',
          dataCriacao: formatDateWithTime(), // ATUALIZADO AQUI
        },
      ],
    },
  ]);

  const qaOptions = [
    'Calvin Santana dos Santos',
    'Ana Julia da Silva',
    'Roberto Carlos Almeida',
  ];

  const confidencialidadeOptions = [
    'Público',
    'Interno',
    'Confidencial',
    'Confidencial Restrito',
    'Secreto',
  ];

  const handleAddCenario = () => {
    const newCenarioId = Date.now();
    setCenarios([
      ...cenarios,
      {
        id: newCenarioId,
        valor: '',
        steps: [
          {
            id: Date.now() + 1,
            descricao: '',
            imagem: null,
            imagemPreview: null,
            status: 'espera',
            dataCriacao: formatDateWithTime(), // ATUALIZADO AQUI
          },
        ],
      },
    ]);
  };

  // ... (handleRemoveCenario, handleCenarioChange permanecem iguais) ...
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


  const handleAddStep = (cenarioId) => {
    setCenarios(
      cenarios.map((cenario) =>
        cenario.id === cenarioId
          ? {
              ...cenario,
              steps: [
                ...cenario.steps,
                {
                  id: Date.now(),
                  descricao: '',
                  imagem: null,
                  imagemPreview: null,
                  status: 'espera',
                  dataCriacao: formatDateWithTime(), // ATUALIZADO AQUI
                },
              ],
            }
          : cenario
      )
    );
  };

  // ... (handleRemoveStep, handleStepChange, handleStepImageChange, handleSubmit permanecem iguais) ...
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

  // O JSX de renderização não precisa de alterações para esta funcionalidade,
  // pois o campo dataCriacao já é exibido como um input readOnly.
  // A mudança no formato do valor será refletida automaticamente.

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
          <label htmlFor="qa">QA:</label>
          <select id="qa" value={qa} onChange={(e) => setQa(e.target.value)} required >
            {qaOptions.map((option) => ( <option key={option} value={option}> {option} </option> ))}
          </select>
        </div>

        {/* Confidencialidade */}
        <div className="form-group">
          <label htmlFor="confidencialidade">Nível de Confidencialidade:</label>
          <select id="confidencialidade" value={confidencialidade} onChange={(e) => setConfidencialidade(e.target.value)} required >
            {confidencialidadeOptions.map((option) => ( <option key={option} value={option}> {option} </option> ))}
          </select>
        </div>

        {/* Cenários */}
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

              {/* Steps para ESTE Cenário */}
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

        <button type="submit" className="button-santander" style={{backgroundColor: '#CC0000', width: '100%', padding: '15px'}}>
          Gerar PDF com Evidências
        </button>
      </form>
    </div>
  );
};

export default Formulario;