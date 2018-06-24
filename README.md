# colonyHackathon
Colony Hackathon Entry - Decentralized Data Science Colony

**Project Description**
The Decentralized Data Science Colony is a decentralized way to gather Data Science teams around publicly available data sets (www.data.gov and other initiatives), teams and reward work accordingly. It covers the basic 5 phases of data science projects: Question, Exploratory Data Analysis, Formal Modeling, Interpretation, Communication.
A single colony can manage various Data Science Projects (defined as Domains). 
Some of the issues tacked by the solution:
1. Establishing clear goals (Question)
2. Avoiding data dredging (trying everything under the Sun for correlation), as sources are tasks and require approval
3. Provide random seeds for reproducible results while avoiding peers from selecting seed that yield specific results when applying non-deterministic algorithms (i.e: K-Means Clustering)
4. Document not only positive results but negative ones too. There is currently an enormous bias towards only publishing positive results while negative ones are equally valid and useful. All research start is public and so are the results
5. Data is greatly available nowadays, never before at this speed and openness, only a fully distributed solution will allow geographically disperse teams (Civic Hackers mostly) to coordinate work and contribute research.

A given DDSC, Distributed Data Science Colony, can host many Data Science projects in parallel, each is hosted in a separate Domain and tasks as further separates into Phases (through Skills for now, sub-Domains in the future). The group can therefore cooperate in multiples projects and share the administration and rewards of the joint effort. Such Colony shall start and complete as many projects as desired, with no need to create a new Colony to house new efforts.

The application was developed using Electron and MaterializeCSS, this combination allows for off-the-internet (blockchain only) use and shall allow more integration in the future with local fylesystem and remote data-sources.

The typical lifecycle of the DDSC is:
1. Upon openning the tool, the user shall select which local Ethereum account will be used for interacting with the DDSCs (https://github.com/mduske/colonyHackathon/blob/master/pics/Opening%20Screen.png)
2. Colony is Created (https://github.com/mduske/colonyHackathon/blob/master/pics/Creating%20a%20new%20DDS%20colony.png)
3. Research Projects represents an individual projects (Domain) to be managed and all existing projects are listed in the  panel on o the rigth (https://github.com/mduske/colonyHackathon/blob/master/pics/Active%20Colony.png)
4. Within a given Research project (https://github.com/mduske/colonyHackathon/blob/master/pics/Research%20Window%20showing%20current%20tasks.png) there are 5 Phases in which Tasks can be created: Question, Exploratory Data Analysis, Formal Modeling, Interpretation, and Communication. Through the use of these phases undesirable behavior such as data dredging (looking for more and more unrelated data set in the hope on some non-causal correlation) or non-reporting of negative results (common practice that prevent much valuable data from being disclosed), also many Scientific Journals request that research shall be first registered with them (to avoid negative result never being published) on which the DDSC can also help.
5. Tasks are created (https://github.com/mduske/colonyHackathon/blob/master/pics/Task%20Window.png), assigned, and completed as usual. External data sources can be linked from IPFS or other sources throgh the use of URLs. A small series of pseudo-random seed is also generated from the tasks Description Hash, these shall be used to seed pseduo-random algorithms can require reproducilibity of "randomness" (used in some models). The seeds provided ensure no attemp is made to find some seed that will skew results intensionaly.

# Setting up the environment
Upon cloning locally the repository, follow these steps (similar to basic hackathon steps):
1. From the root folder of the project, run: yarn
2. Start Ganash: yarn start-ganache
3. Start Trufflepig: yarn start-trufflepig
4. Deploy all contract, either through trufflepig or yarn, for yarn run: yarn deploy-contracts
5. Start the DDSC tool by either running "yarn start" or "electron ." (the yarn command has a path for electron that is usable only in MacOS and Linux)

# Working Code vs Mockups
Some of the tool could not be finished in time for the final hackathon commit, here we describe where the tool is truly communicationg with the Colony Contract and where we are navigating mockups.
If you do not create or open a Colony after selecting the user, then you are navigating the mockup, links will navigate to the target windows, buttons will either show realistic behavior or just do nothing.

**Completed parts:**
1. Initial account selection
2. Colony Creation thorugh the menu
3. Opening of existing Colony from the menu
4. Recently opened Colonies are stored offline and are persistent accross reboots (but remember that ganash will not persist contract if restarted)


**Incomplete (Mockup only): **
