evaluateHistoryType(historyResponse: any[]): void {
  if (!historyResponse?.length) return;

  this.historyResponseLength = historyResponse.length;
  this.typeCount = 0;
  this.isStreaming = false;
  this.isLoading = false;

  const first = historyResponse[0];
  const userQuestion = this.createUserQuestion(first);

  this.addUniqueMessage(this.messages, userQuestion);
  this.messageResponses = [...this.messageResponses, userQuestion];

  const pdfRequests$ = [];

  for (const step of historyResponse) {
    this.historyIndex = 1;

    for (const response of step.response ?? []) {
      if (response.type === 'image') {
        const pdfRequest$ = this.handleImageResponse(step, response);
        pdfRequests$.push(pdfRequest$);
      } else if (response.type === 'text') {
        this.handleTextResponse(step);
      }
    }
  }

  // Run all PDF (image) requests in parallel for speed
  if (pdfRequests$.length > 0) {
    this.subscriptions.add(
      forkJoin(pdfRequests$).subscribe({
        complete: () => {
          this.scrollToBottomV2();
        },
      })
    );
  } else {
    this.scrollToBottomV2();
  }
}



private createUserQuestion(first: any) {
  return {
    index: this.messageResponses.length,
    isChatHistory: true,
    sentBy: 'user',
    isTextResponse: true,
    isImageChart: false,
    isDatasheet: false,
    row_id: first?.message_id,
    session_id: first?.session_id,
    message_id: first?.message_id,
    content: first?.question,
    system: first?.system,
  };
}

private handleImageResponse(step: any, response: any) {
  this.isImageChartLoading = true;
  this.chartDescription = response.description;
  const imageName = this.getPdfFileName(response.path);

  return this.pdfServiceService
    .getDataFile(step?.session_id, this.nbkkid, response.path)
    .pipe(
      map((blob) => {
        if (blob) {
          const pngSource = URL.createObjectURL(blob);
          const imageResponse = {
            index: this.messageResponses.length,
            indexSub: this.historyIndex++,
            isTextResponse: false,
            isImageChart: true,
            isDatasheet: false,
            chartPath: `${pngSource}#${imageName}`,
            isChatHistory: true,
            sentBy: 'bot',
            message_id: step?.message_id,
            session_id: step?.session_id,
            response_comment: step?.response_comment,
            response_rank: step?.response_rank,
            source_comment: step?.source_comment,
            source_rank: step?.source_rank,
          };
          this.messageResponses = [...this.messageResponses, imageResponse];
        }
      }),
      tap(() => this.getDataSheet(step, this.historyIndex))
    );
}

private handleTextResponse(step: any) {
  if (!step?.response?.length) return;

  for (const res of step.response) {
    const messageResponse = this.buildMessageResponse(step, res);

    const isFileProcessing =
      Array.isArray(res.response) &&
      res.response[0]?.response ===
        'File(s) may be processing or unavailable. Please check your knowledge bases.';

    if (isFileProcessing) {
      this.isFileProcessing = true;
    } else if (step.source?.length) {
      const source = step.source[0];
      messageResponse.filename = source.source_path ?? '';
      messageResponse.pageLabel = source.page_number ?? '';
      messageResponse.sourceText = source.content ?? '';

      if (this.chatData$) {
        this.chatData$.filename = source.source_path ?? '';
        this.chatData$.pageLabel = source.page_label ?? '';
        this.chatData$.sourceText = source.text ?? '';
        this.chatTwoService.sendChatData(this.chatData$);
      }
    }

    if (this.typeCount++ <= this.historyResponseLength) {
      this.addUniqueMessage(this.messages, messageResponse);
    }
  }
}

private buildMessageResponse(step: any, res: any) {
  const source = step.source?.[0];
  return {
    index: this.messages.length,
    isChatHistory: true,
    sentBy: 'bot',
    role: res.role,
    isTextResponse: true,
    isImageChart: false,
    isDatasheet: false,
    textResponse: res.response,
    row_id: step.row_id,
    session_id: step.session_id,
    message_id: step.message_id,
    content: res.response,
    response_comment: step.response_comment,
    response_rank: step.response_rank,
    source_comment: step.source_comment,
    source_rank: step.source_rank,
    system: step.system ?? '',
    updated_at: step.updated_at,
    filename: source?.source_path ?? '',
    pageLabel: source?.page_number ?? '',
    sourceText: source?.text ?? '',
  };
}

private addUniqueMessage(target: any[], newMsg: any) {
  const exists = target.some(
    (msg) =>
      msg.sentBy === newMsg.sentBy &&
      msg.message_id === newMsg.message_id &&
      msg.session_id === newMsg.session_id
  );
  if (!exists) target.push(newMsg);
}
