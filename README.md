# Discord Project Managment Bot

### <a href="https://discord.com/api/oauth2/authorize?client_id=937356374038437938&permissions=8&scope=bot%20applications.commands" target="_blank">Invite link for the bot</a>

## TODO
### Go to <a href="https://github.com/pmakowski23/DiscordProjectManager/projects/1" target="_blank">Project</a> / <a href="https://github.com/pmakowski23/DiscordProjectManager/issues" target="_blank">Issues</a>

## Commands

- `/new-project {name}` creates new category based on provided name and basic roles and channels connected with the project 
- `/clear` to clear all channels and roles with DW in them (for testing purposes)

## New project
for demonstration purposes:
- Project shortname: DW
- Project name: Dream work
- channel name is preceded with `#`

New project creates 1 category with the new project name and 4 channels in that category:
- Dream work
  - `#DW-general` - can be used for general conversation about a project
  - `#DW-frontend` - to be used only for frontend related topics
  - `#DW-backend` - to be used only for backend related topics
  - `#DW-devops` - to be used only for devops related topics

And also roles from that channel names with additional `DW-projectManager`

`DW-general`, `DW-frontend`, `DW-backend` and `DW-devops` roles have access only to `#DW-general` and role specific channels in the project. `DW-projectManager` role, on the other hand has access to every channel connected with the project.

After creation of the roles and channels, 2 messanges are sent:
- to the channel from where command was invoked with information, that new project is created and a button that gives you `DW-general` role so you can participate in that project.
- to `#DW-general` channel of the project with roles that user can have in the project (`DW-frontend`, `DW-backend`, `DW-devops`) and button that can assign proper roles
that are then pinned to the channels
