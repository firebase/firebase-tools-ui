/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EmulatorConfig } from '../../store/config';

export enum WebSocketState {
  DISCONNECTED,
  CONNECTED,
  PENDING,
}

export class ReconnectingWebSocket {
  state: WebSocketState = WebSocketState.DISCONNECTED;
  listener: Function | undefined = undefined;

  constructor(config: EmulatorConfig) {
    this.connect(config);
    setInterval(this.connect.bind(this), 1000);
  }

  private connect(config: EmulatorConfig) {
    if (this.state !== WebSocketState.DISCONNECTED) return;

    const ws = new WebSocket(`ws://${config.hostAndPort}`);
    this.state = WebSocketState.PENDING;

    ws.onopen = () => {
      this.state = WebSocketState.CONNECTED;
    };

    ws.onclose = () => {
      this.state = WebSocketState.DISCONNECTED;
    };

    ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      this.listener && this.listener(data);
    };
  }
}
