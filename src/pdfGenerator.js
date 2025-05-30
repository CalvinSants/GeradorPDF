import jsPDF from 'jspdf';

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      console.error(`Erro ao carregar imagem: ${src}`, err);
      reject(err);
    };
    img.src = src;
  });
};

export const generatePdf = async (data) => {
  const doc = new jsPDF();
  let yPos = 20; // Posição Y inicial

  // Configurações de fonte (mesma lógica de antes)
  doc.setFont('helvetica', 'normal');

  // CABEÇALHO COM LOGOS
  try {
    const logo1 = await loadImage(data.logo1Path || '/assets/logo1_mock.png');
    const logo2 = await loadImage(data.logo2Path || '/assets/logo2_mock.png');
    doc.addImage(logo1, 'PNG', 15, 10, 30, 15);
    doc.addImage(logo2, 'PNG', doc.internal.pageSize.getWidth() - 45, 10, 30, 15);
  } catch (error) {
    console.error("Erro ao carregar logos para PDF:", error);
    doc.text("Erro logo", 15, 15);
  }
  yPos += 20;

  // TÍTULO
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('Relatório de Teste de Software', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
  yPos += 15;

  // INFORMAÇÕES GERAIS
  doc.setFontSize(12);
  doc.text(`PBI: ${data.pbi}`, 15, yPos); yPos += 7;
  doc.text(`QA Tester: ${data.qa}`, 15, yPos); yPos += 7;
  doc.text(`Nível de Confidencialidade: ${data.confidencialidade}`, 15, yPos); yPos += 10;

  // MARCA D'ÁGUA (mesma lógica, mas aplicar após todo conteúdo ou recalcular páginas)
  // É melhor aplicar a marca d'água no final, após saber o número total de páginas.

  // --- CENÁRIOS E SEUS STEPS ---
  for (const [cenarioIndex, cenario] of data.cenarios.entries()) {
    if (yPos > 260) { doc.addPage(); yPos = 20; } // Nova página para novo cenário se necessário

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cenário ${cenarioIndex + 1}: ${cenario.valor}`, 15, yPos);
    yPos += 10;

    // --- STEPS DESTE CENÁRIO ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Steps:', 20, yPos); // Leve indentação para os steps
    yPos += 8;

    for (const [stepIndex, step] of cenario.steps.entries()) {
      if (yPos > 250) { doc.addPage(); yPos = 20; } // Nova página para step se necessário

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Step ${stepIndex + 1}:`, 25, yPos); // Maior indentação
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      doc.text(`Data de Criação: ${step.dataCriacao}`, 30, yPos); yPos += 5;

      const statusText = `Status: ${step.status.toUpperCase()}`;
      let statusColor = [0,0,0]; // jsPDF usa array [r,g,b] ou string hex
      if (step.status === 'ok') statusColor = [40, 167, 69];    // Verde
      else if (step.status === 'nok') statusColor = [220, 53, 69]; // Vermelho
      else if (step.status === 'espera') statusColor = [108, 117, 125]; // Cinza
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(statusText, 30, yPos);
      doc.setTextColor(0,0,0); // Reset color
      yPos += 5;

      const descLines = doc.splitTextToSize(`Descrição: ${step.descricao}`, doc.internal.pageSize.getWidth() - 60); // (largura - margens - indentação)
      doc.text(descLines, 30, yPos);
      yPos += (descLines.length * 4) + 4; // Ajuste baseado no número de linhas

      if (step.imagemPreview) {
        try {
          const imgElement = await loadImage(step.imagemPreview);
          const aspectRatio = imgElement.width / imgElement.height;
          let imgWidth = 60;
          let imgHeight = imgWidth / aspectRatio;
          if (imgHeight > 50) { imgHeight = 50; imgWidth = imgHeight * aspectRatio; }

          if (yPos + imgHeight > 280) { doc.addPage(); yPos = 20; }
          doc.addImage(step.imagemPreview, 'PNG', 30, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 8;
        } catch (error) {
          console.error("Erro ao adicionar imagem do step ao PDF:", error);
          doc.text("Erro ao carregar imagem.", 30, yPos); yPos += 10;
        }
      }
      yPos += 5; // Espaço extra entre steps
    }
    yPos += 10; // Espaço extra entre cenários
  }

  // --- MARCA D'ÁGUA E NÚMERO DE PÁGINAS (APLICAR NO FINAL) ---
  const totalPages = doc.internal.getNumberOfPages();

  // Marca d'água
  doc.setFontSize(60);
  doc.saveGraphicsState(); // Salva o estado atual (cor, etc.)
  doc.setGState(new doc.GState({opacity: 0.15})); // Opacidade
  doc.setTextColor(150); // Cinza para marca d'água

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Adiciona a marca d'água no centro de cada página
    doc.text(
      data.confidencialidade.toUpperCase(),
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() / 2,
      { angle: -45, align: 'center' }
    );
  }
  doc.restoreGraphicsState(); // Restaura o estado gráfico
  doc.setTextColor(0, 0, 0); // Volta cor para preto

  // Número de páginas
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  let pbiNomeArquivo = String(data.pbi || 'Relatorio_Teste') // Garante que é string e tem um fallback
    .trim() // Remove espaços no início e fim
    .replace(/\s+/g, '_') // Substitui um ou mais espaços por um único underscore
    // Remove caracteres inválidos em nomes de arquivo comuns em Windows/Linux/Mac.
    // Você pode ajustar esta regex conforme necessário.
    .replace(/[\\/:*?"<>|#%&{}]/g, '');

  // Se o nome do arquivo ficar vazio após a sanitização (ex: PBI era só "??")
  if (!pbiNomeArquivo) {
    pbiNomeArquivo = 'Relatorio_PBI_Invalido';
  }

  // Adiciona a extensão .pdf
  const nomeFinalDoArquivo = `${pbiNomeArquivo}.pdf`;

  // Salva o PDF com o nome dinâmico
  doc.save(nomeFinalDoArquivo);
};