# codelly

codelly is a Node.JS module for online compiling. Based on [Compilex](https://github.com/scriptnull/compilex).

  

## Supported Languages



| Language | Support |
|---------|:-------:|
|C |&#x2714;|
|C++ | &#x2714; |
|Java | &#x2714; |
|Python | &#x2714; |
|C# | &#x2714; |
|Visual Basic | &#x2714; |
|Rust | &#x2714; |
|GO | &#x2714; |
|PHP | &#x2714; |
|Swift | &#x2714; |

  

## Setting Up Compilers

  

<h4>C and C++</h4>
<ol>
<li>Windows : <a  href="https://www.mingw-w64.org/">MinGw-w64</a></li>
<li>Linux : <a  href="http://gcc.gnu.org/wiki/InstallingGCC">GCC</a></li>
</ol>

  

<h4>Java</h4>
<ol>
<li>Windows - Linux : <a  href="https://www.oracle.com/java/technologies/downloads/">JDK</a></li>
</ol>

  

<h4>Python</h4>
<ol>
<li>Windows - Linux : <a  href="https://www.python.org/downloads/">Python</a></li>
</ol>

  

<h4>C#</h4>
<ol>
<li>Windows : <a  href="https://dotnet.microsoft.com/en-us/download/dotnet-framework">.NET Framework</a></li>
<li>Linux : <a  href="https://www.mono-project.com/download/stable/">Mono</a></li>
</ol>

  

<h4>Visual Basics</h4>
<ol>
<li>Windows : <a  href="https://dotnet.microsoft.com/en-us/download/dotnet-framework">.NET Framework</a></li>
</ol>

  

<h4>Rust</h4>
<ol>
<li>Windows - Linux : <a  href="https://www.rust-lang.org/tools/install">Rust</a></li>
</ol>

  

<h4>GO</h4>
<ol>
<li>Windows - Linux : <a  href="https://go.dev/doc/install">GO</a></li>
</ol>

  

<h4>PHP</h4>
<ol>
<li>Windows : <a  href="https://windows.php.net/download/">PHP for Windows</a></li>
<li>Linux : <a  href="https://www.php.net/downloads/">PHP for Linux</a></li>
</ol>

  

<h4>Swift</h4>
<ol>
<li>Windows - Linux : <a  href="https://www.swift.org/download/">Swift.org</a></li>
</ol>

  

## Documentation

<h5>At first - Require </h5>

```javascript
var  compiler  =  require('codelly');
var  options  = {stats : true}; //prints stats to console
compiler.init(options);
```

<h5>C and C++ </h5>

```javascript
//if windows
var  envData  = { OS : "windows" , cmd : "g++" ,options: {timeout:100000}}; // (uses g++ command to compile )
//else
var  envData  = { OS : "linux" , cmd : "gcc" }; // ( uses gcc command to compile )

//Without Input:
compiler.compileCPP(envData , code , function (data) {
	res.send(data);
	//data.error = error message
	//data.output = output value
});
//With Input
compiler.compileCPPWithInput(envData , code , input , function (data) {
	res.send(data);
});
```

<h5>Java</h5>

```javascript
//if windows
var  envData  = { OS : "windows"};
//else
var  envData  = { OS : "linux" };

//Without Input:
compiler.compileJava( envData , code , function(data){
    res.send(data);
});
//With Input
compiler.compileJavaWithInput( envData , code , input , function(data){
    res.send(data);
});
```


<h5>Python</h5>


```javascript
//if your server's python command is 'python'
var  envData  = { cmd : "python"};
//else if your server's python command is 'python3'
var  envData  = { OS : "python3" };

//Without Input:
compiler.compilePython( envData , code , function(data){
    res.send(data);
});
//With Input
compiler.compilePythonWithInput( envData , code , input , function(data){
    res.send(data);
});
```


<h5>C#</h5>


```javascript
//if windows
var  envData  = { OS : "windows"};
//else
var  envData  = { OS : "linux" };

//Without Input:
compiler.compileCS( envData , code , function(data){
    res.send(data);
});
//With Input
compiler.compileCSWithInput( envData , code , input , function(data){
    res.send(data);
});
```

<h5>Visual Basic</h5>

```javascript
var  envData  = { OS : "windows"};

//Without Input:
compiler.compileVB( envData , code , function(data){
    res.send(data);
});
//With Input
compiler.compileVBWithInput( envData , code , input , function(data){
    res.send(data);
});
```


<h5>Rust</h5>

```javascript
//if windows
var  envData  = { OS : "windows"};
//else
var  envData  = { OS : "linux" };

//Without Input:
compiler.compileRust( envData , code , function(data){
    res.send(data);
});
//With Input
compiler.compileRustWithInput( envData , code , input , function(data){
    res.send(data);
});
```


<h5>GO</h5>

```javascript
//if windows
var  envData  = { OS : "windows"};
//else
var  envData  = { OS : "linux" };

//Without Input:
compiler.compileGO( envData , code , function(data){
    res.send(data);
});
//With Input
compiler.compileGOWithInput( envData , code , input , function(data){
    res.send(data);
});
```

<h5>PHP</h5>

```javascript
//if windows
var  envData  = { OS : "windows"};
//else
var  envData  = { OS : "linux" };

//Without Input:
compiler.compilePHP( envData , code , function(data){
    res.send(data);
});
//With Input
compiler.compilePHPWithInput( envData , code , input , function(data){
    res.send(data);
});
```

<h5>Swift</h5>

```javascript
//if windows
var  envData  = { OS : "windows"};
//else
var  envData  = { OS : "linux" };

//Without Input:
compiler.compileSwift( envData , code , function(data){
    res.send(data);
});
//With Input
compiler.compileSwiftWithInput( envData , code , input , function(data){
    res.send(data);
});
```

<h4>Additionals: </h4>

<h5>Memory Management </h5>

```javascript
compiler.flush(function(){
console.log('All temporary files flushed !');
});
```
Synchronous version of flush
```javascript
compiler.flushSync();
```
<h5>Statistical Data</h5>

```javascript
compiler.fullStat(function(data){
    res.send(data);
});
```

  

## Licence

This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.