# Pull request formatting policy

Before opening any pull request, run `pnpm.cmd format` from the repository
root. Commit every tracked change produced by that command on the pull request
branch before opening the pull request.

Do not validate formatter output with a formatting check. Treat the formatter's
output as correct.
