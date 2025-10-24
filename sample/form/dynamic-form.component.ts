evaluateHistoryType(historyResponse: any) {
  this.historyResponseLength = historyResponse.length;
  this.typeCount = 0;

  let userQuestion = {
    index: this.messageResponses.length,
    isChatHistory: true,
    sentBy: 'user',
    isTextResponse: true,
    isImageChart: false,
    isDatasheet: false,
    row_id: historyResponse[0]?.message_id,
    session_id: historyResponse[0]?.session_id,
    message_id: historyResponse[0]?.message_id,
    content: historyResponse[0]?.question,
    system: historyResponse[0]?.system,
  };

  this.messageResponses = [...this.messageResponses, userQuestion];

  // Add userQuestion only if not already present
  if (
    !this.messages.some(
      msg =>
        msg.sentBy === 'user' &&
        msg.message_id === userQuestion.message_id &&
        msg.session_id === userQuestion.session_id
    )
  ) {
    this.messages.push(userQuestion);
  }

  for (let step = 0; step < historyResponse.length; step++) {
  this.historyIndex = 1;
  historyResponse[step]?.response.forEach((response: any) => {
    if (response?.type === 'image') {
      this.isImageChartLoading = true;
      this.chartDescription = response.description;
      let imageName = this.getPdfFileName(response.path);
      this.subscriptions.add(
        this.pdfServiceService
          .getDataFile(historyResponse?.[step]?.session_id, this.nbkkid, response.path)
          .subscribe({
            next: (blob) => {
              if (blob) {
                let pngSource = URL.createObjectURL(blob);
                let imageResponse = {
                  index: this.messageResponses.length,
                  indexSub: this.historyIndex,
                  isTextResponse: false,
                  isImageChart: true,
                  isDatasheet: false,
                  chartPath: `${pngSource}#${imageName}`,
                  isChatHistory: true,
                  sentBy: 'bot',
                  message_id: historyResponse[step]?.message_id,
                  session_id: historyResponse[step]?.session_id,
                  response_comment: historyResponse[step]?.response_comment,
                  response_rank: historyResponse[step]?.response_rank,
                  source_comment: historyResponse[step]?.source_comment,
                  source_rank: historyResponse[step]?.source_rank,
                };
                this.messageResponses = [...this.messageResponses, imageResponse];
              }
            },
            error: (err) =>
              console.error(
                'Chat Two this.pdfServiceService.getDataFile emitted an error: ' + err
              ),
            complete: () => {
              this.getDataSheet(historyResponse[step], this.historyIndex);
              this.historyIndex++;
              this.scrollToBottomV2();
            },
          })
      );
    }
  });

  if (response?.type === 'text') {
  if (response?.response && response.response.length > 0) {
    for (let i = 0; i < historyResponse[step].response.length; i++) {
      let messageResponse = {
        index: this.messages.length,
        isChatHistory: true,
        sentBy: 'bot',
        role: historyResponse[step].response[i].role,
        isTextResponse: true,
        isImageChart: false,
        isDatasheet: false,
        textResponse: historyResponse[step].response[i].response,
        row_id: historyResponse[step].row_id,
        session_id: historyResponse[step].session_id,
        message_id: historyResponse[step].message_id,
        content: historyResponse[step].response[i].response,
        response_comment: historyResponse[step].response_comment,
        response_rank: historyResponse[step].response_rank,
        source_comment: historyResponse[step].source_comment,
        source_rank: historyResponse[step].source_rank,
        system: historyResponse[step].system ?? '',
        updated_at: historyResponse[step].updated_at,
        filename: historyResponse[step]?.source_path ?? '',
        pageLabel: '',
        sourceText: ''
      };

      if (historyResponse[step] && historyResponse[step].source) {
        messageResponse.pageLabel = historyResponse[step].source[0]?.page_number;
        messageResponse.sourceText = historyResponse[step].source[0]?.text;
      }

      const respArr = historyResponse[step].response[i]?.response ?? '';
      if (
        Array.isArray(respArr) &&
        respArr[0]?.response ===
          'File(s) may be processing or unavailable. Please check your knowledge bases.'
      ) {
        this.isFileProcessing = true;
      } else {
        if (historyResponse[step] && historyResponse[step].source) {
          const source = historyResponse[step].source[0];
          if (source?.source_path) {
            messageResponse.filename = source.source_path ?? '';
            messageResponse.pageLabel = source.page_number ?? '';
            messageResponse.sourceText = source.content ?? '';
            if (this.chatData5) {
              this.chatData5.filename = source.source_path ?? '';
              this.chatData5.pageLabel = source.page_label ?? '';
               this.chatData5.sourceText = source.text ?? '';
            }
            this.chatTwoService.sendChatData(this.chatData$)
          }
        }
      }


      if (this.typeCount <= this.historyResponseLength) {
    // Only add if not already present (by sentBy, message_id, session_id)
    const exists = this.messages.some(
        msg =>
            msg.sentBy === messageResponse.sentBy &&
            msg.message_id === messageResponse.message_id &&
            msg.session_id === messageResponse.session_id
    );
    if (!exists) {
        this.messages.push(messageResponse);
    }
    this.typeCount++;
}
this.isStreaming = false;
this.isLoading = false;
this.scrollToBottomV2();

    }
  }
})
  }



}
