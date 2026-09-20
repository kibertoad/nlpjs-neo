import { containerBootstrap } from '../../packages/core-loader/src/index.js';

async function main() {
  // We create a new container. This will load plugins from ./plugins and
  // pipelines from pipelines.md
  const container = containerBootstrap();
  const input = 'GNIHTEMOS';
  // We call the pipeline.
  const result = await container.runPipeline('reverse-and-capitalize', input);
  console.log(result); // It should log "Something"
}

main();
