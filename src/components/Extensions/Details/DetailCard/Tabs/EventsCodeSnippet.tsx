/**
 * Copyright 2022 Google LLC
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

import { Markdown } from '../../../../common/Markdown';
import { useExtension } from '../../../api/useExtension';

export function EventsCodeSnippet() {
  const extension = useExtension()!;
  if (
    extension.eventarcChannel &&
    extension.allowedEventTypes &&
    extension.allowedEventTypes.length > 0
  ) {
    const eventsMd = `
   ### Create Custom Event Handlers
   
   This extension publishes events to the \`${
     extension.eventarcChannel
   }\` channel. You can create custom handlers that respond to events on this channel. For example:
   
     import { onCustomEventPublished } from "firebase-functions/v2/eventarc";
 
     export const eventhandler = onCustomEventPublished(
       "${extension.allowedEventTypes ? extension.allowedEventTypes[0] : ''}",
       (e) => {
           // Handle extension event here.
       });
     `;
     return <Markdown data-testid="events-code-snippet">{eventsMd}</Markdown>;
  }
  return <div />
}
