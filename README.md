# webhook-admin
Program is designed to create webhook url points for running terminal commands when trigerred.

### Features
Supports POST & GET methods
Can create command template with variables

### UI
![main screen](https://ik.imagekit.io/ozcan/webhook/ssmain.png?tr=w-400,h-300)
![webhook list](https://ik.imagekit.io/ozcan/webhook/ss2.png?tr=w-400,h-300)
![add new hook](https://ik.imagekit.io/ozcan/webhook/ss1.png?tr=w-400,h-300)

### How to use
When you are creating a webhook, you can set a template for the command.
For example; we cant to create a command to browse any folder in our linux os.

```js
ls $extra $folder
```
With these settings, we can send the webhook such parametters. 


**For GET Method**
```
http://<server_ip>:<server_port>/hook/<hood_id>?extra=-la&folder=/home/ozcan
```
If we visit such url, we will send *extra* and *folder* variables and the built command will be 
```
ls -la /home/ozcan
```


**For POST Method**
```
{
  "extra": "-la",
  "folder": "/home/ozcan"
}
```
We can send such json data as post parameter, we will create following command as well
```
ls -la /home/ozcan
```

## Setting Up Server
All data store in **settings.json** file. To browse the file location, you can click on **Server Status** value on main window. It will automatically open the containing folder.

## Background Commands
To mark a webhook as **background** changes how will be executed. A standart webhook runs the command and waits for the terminal responses. However, when a command takes long time to execute, it may create long waiting time to cause problems.

For such times, you may run the command as background task. You will start the command without waiting to finish.

## Webhook Details
To get more information about last execution of the webhook, you can click on the **last execution time** on the **Manage Hooks** window. The code template block will change and show you executer IP address and the result of the code.
