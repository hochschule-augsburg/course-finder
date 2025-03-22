<script lang="ts" setup>
import type { Options, PluginSimple } from 'markdown-it'

import VueMarkdown from 'vue-markdown-render'

const props = defineProps<{
  source?: string
}>()
const newTabLinkPlugin: PluginSimple = (md) => {
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrJoin('onclick', 'event.stopPropagation()')

    return defaultRender(tokens, idx, options, env, self)
  }
}

const options: Options = {
  linkify: true,
}
const plugins = [newTabLinkPlugin]
</script>

<template>
  <VueMarkdown
    :options="options"
    :plugins="plugins"
    :source="props.source"
    class="cf-markdown-component"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.cf-markdown-component {
  ul {
    padding: revert;
  }
  ol {
    padding: revert;
  }
}
</style>
