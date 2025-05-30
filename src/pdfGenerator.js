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
  let yPos = 20;
  const leftMargin = 15;
  const rightMargin = 15;
  const contentWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin;

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

  // PBI
  const pbiFullText = `PBI: ${data.pbi}`;
  const pbiLines = doc.splitTextToSize(pbiFullText, contentWidth);
  doc.text(pbiLines, leftMargin, yPos);
  yPos += doc.getTextDimensions(pbiLines).h + 4; // Altura do texto do PBI + 4 de espaçamento

  // QA Tester
  const qaFullText = `QA Tester: ${data.qa}`;
  const qaLines = doc.splitTextToSize(qaFullText, contentWidth); // Aplicando quebra de linha por segurança
  doc.text(qaLines, leftMargin, yPos);
  yPos += doc.getTextDimensions(qaLines).h + 4; // Altura do texto do QA + 4 de espaçamento

  // Nível de Confidencialidade
  const confidFullText = `Nível de Confidencialidade: ${data.confidencialidade}`;
  const confidLines = doc.splitTextToSize(confidFullText, contentWidth); // Aplicando quebra de linha por segurança
  doc.text(confidLines, leftMargin, yPos);
  yPos += doc.getTextDimensions(confidLines).h + 8; // Altura do texto de Confid. + 8 de espaçamento (um pouco mais antes da próxima seção)

  // --- CENÁRIOS E SEUS STEPS ---
  for (const [cenarioIndex, cenario] of data.cenarios.entries()) {
    if (yPos > 260) { doc.addPage(); yPos = 20; }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const scenarioTitleText = `Cenário ${cenarioIndex + 1}: ${cenario.valor}`;
    // Largura máxima para o texto do cenário, considerando a margem esquerda de 'leftMargin'
    const scenarioTextLines = doc.splitTextToSize(scenarioTitleText, contentWidth);
    doc.text(scenarioTextLines, leftMargin, yPos);
    const scenarioTextDimensions = doc.getTextDimensions(scenarioTextLines);
    yPos += scenarioTextDimensions.h + 7; // +7 para um pouco de espaçamento abaixo do bloco de cenário

    // --- STEPS DESTE CENÁRIO ---
    // Definindo uma margem interna para os steps, um pouco mais à direita
    const stepLeftMargin = leftMargin + 5; // Ex: 20


    doc.setFontSize(12); // Tamanho da fonte para o título "Steps:"
    doc.setFont('helvetica', 'bold');
    // Não há necessidade de quebrar "Steps:" pois é curto
    doc.text('Steps:', stepLeftMargin, yPos);
    yPos += doc.getTextDimensions('Steps:').h + 2; // Espaçamento após "Steps:"


    for (const [stepIndex, step] of cenario.steps.entries()) {
      // Verifica se precisa de nova página ANTES de desenhar o step
      // Estimar altura do step pode ser complexo, então checar com uma folga maior
      // ou após cada parte principal do step (descrição, imagem)
      if (yPos > 240) { // Deixar uma folga maior para steps com imagem
          doc.addPage();
          yPos = 20;
          // Se houver quebra de página no meio dos steps de um cenário,
          // pode ser útil repetir o título do cenário ou alguma indicação. (Opcional)
      }

      const stepTitleIndent = stepLeftMargin + 5; // Ex: 25
      const stepDataIndent = stepTitleIndent + 5; // Ex: 30
      const stepBlockContentWidth = doc.internal.pageSize.getWidth() - stepDataIndent - rightMargin;


      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      // Não há necessidade de quebrar o título do step pois é curto
      doc.text(`Step ${stepIndex + 1}:`, stepTitleIndent, yPos);
      yPos += doc.getTextDimensions(`Step ${stepIndex + 1}:`).h + 4;


      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Data de Criação
      const dataCriacaoText = `Data de Criação: ${step.dataCriacao}`;
      doc.text(dataCriacaoText, stepDataIndent, yPos);
      yPos += doc.getTextDimensions(dataCriacaoText).h + 2;

      // Status
      const statusText = `Status: ${step.status.toUpperCase()}`;
      let statusColor = [0,0,0];
      if (step.status === 'ok') statusColor = [40, 167, 69];
      else if (step.status === 'nok') statusColor = [220, 53, 69];
      else if (step.status === 'espera') statusColor = [108, 117, 125];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(statusText, stepDataIndent, yPos);
      doc.setTextColor(0,0,0); // Reset color
      yPos += doc.getTextDimensions(statusText).h + 2;

      // Descrição do Step (com quebra de linha)
      const stepDescriptionLabel = "Descrição: ";
      doc.text(stepDescriptionLabel, stepDataIndent, yPos); // Imprime o label "Descrição:"
      // Calcula a largura restante para o texto da descrição após o label
      const labelWidth = doc.getTextWidth(stepDescriptionLabel);
      const descriptionTextX = stepDataIndent + labelWidth;
      const descriptionMaxWidth = doc.internal.pageSize.getWidth() - descriptionTextX - rightMargin;

      const stepDescTextLines = doc.splitTextToSize(step.descricao, descriptionMaxWidth > 0 ? descriptionMaxWidth : stepBlockContentWidth ); // Garante que a largura não seja negativa

      // Se o label e o texto da descrição estão na mesma linha inicial:
      if (step.descricao) { // Só imprime e avança se houver descrição
        doc.text(stepDescTextLines, descriptionTextX, yPos); // Imprime o texto da descrição ao lado do label
        // getTextDimensions funciona melhor com strings ou arrays de strings, não diretamente com o output de splitTextToSize se for para calcular altura de um bloco específico.
        // Para obter a altura correta do bloco de descrição (que pode ter várias linhas):
        const stepDescDimensions = doc.getTextDimensions(stepDescTextLines);
        yPos += stepDescDimensions.h + 4; // Avança yPos pela altura do bloco de descrição + espaçamento
      } else {
        yPos += doc.getTextDimensions(stepDescriptionLabel).h +4; // Avança mesmo se não houver descrição, para o próximo item
      }


      // Imagem do Step
      if (step.imagemPreview) {
        // Adicionar verificação de espaço antes de adicionar a imagem
        const imgHeightEstimate = 60; // Uma estimativa da altura da imagem + padding
        if (yPos + imgHeightEstimate > doc.internal.pageSize.getHeight() - rightMargin - 10) { // -10 para rodapé
            doc.addPage();
            yPos = 20;
        }
        try {
          const imgElement = await loadImage(step.imagemPreview);
          const aspectRatio = imgElement.width / imgElement.height;
          let imgWidth = 80; // Largura máxima da imagem no PDF
          let imgHeight = imgWidth / aspectRatio;

          if (imgHeight > 70) { // Altura máxima para não ocupar muito espaço
              imgHeight = 70;
              imgWidth = imgHeight * aspectRatio;
          }
          doc.addImage(step.imagemPreview, 'PNG', stepDataIndent, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 8; // Espaçamento após a imagem
        } catch (error) {
          console.error("Erro ao adicionar imagem do step ao PDF:", error);
          const errorImgText = "Erro ao carregar imagem do step.";
          doc.text(errorImgText, stepDataIndent, yPos);
          yPos += doc.getTextDimensions(errorImgText).h + 4;
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