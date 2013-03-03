mObjects
========

mObjects is a syntax to express & interchange "data" - similar to JSON (or YAML, or XML or your-favourite).  It's suitable for anything from simple "lists of properties"-type configurations, via moderate "business data", to complex nested models e.g. to describe UIs.

mObjects (MO) means... modeled objects? Michael's objects? ;-) _TODO This should really rather be called (something)ML?_


Style
-----

The syntax is unambiguous for anything that really matters ( _TODO or should be made so if I screwed anything up_ ). However, for certain minor syntactic choices which have little real impact on implementations (separators, comments, etc.), intentionally caters to slightly varying tastes that different communities have grown accustomed to. 


Spec: Core
----------

MObjects are sequences of Name/Value pair Properties. Names and Values are separated by '=' or ':' or '=>'. Properties may be separated by commas, semicolons, or newlines. If key name is a simple ID matching the regular expression /[a-zA-Z_][a-zA-Z0-9_]+/ then it doesn't have to be single or double quoted, otherwise it does.  Some examples:

    a: 1

    a: 1
    b = "hello, world" 

    "ns:c./-" => 'Yu\nhu'

Available Property Names MAY (!) be constrained, and IDE syntax completion assisted, by some sort of "schema" (_TODO: better more neutral term, without XSD association?_). Valid Values, for a given Property, may again be constrained by the same schema (incl. for "enumerations").

Values may be MObjects themselves, called "structs" here, and expressed via curly braces; for example:

    a: 1, s: { x: 23; y: 47 } 

Note that, as seen above, you do NOT have to have a root struct (as in JSON), if all you need is a flat list of name value properties it's OK to omit it as parsers will assume a root struct. But you can put them as well, so this is valid (and means exactly the same as a:1) :

    { a : 1 } 

The built-in Primitive Value Literals are similar to JSON and TOML:

* String
* Number: If no dot then a signed 64 bit (long) value, so -2^63 .. 2^63-1; if with dot then a "double-precision 64-bit IEEE 754 floating point" (Java double) value. Scientific ('e') notation and similar not supported, nor '_' separators, nor hex or other notations.
* Boolean: Either 'true' or 'false', without any single or double quotes, always lowercase
* DateTime "are ISO8601 dates, but only the full zulu form is allowed" : 1979-05-27T07:32:00Z

Also see below for Extended Value Literals syntax; this is particularly useful to support literals for e.g. larger numbers (a la Java's BigInteger & BigDecimal and similar in other languages), extended Data / Time stuff, etc.

Again as in JSON and inspired by TOML, values may be "multi value" lists of MObjects, and expressed via square brackets; for example:

    numbers: [ 1, 2, 3 ], colours: [ "red", "yellow", "green", ]
    mixedListOfList: [ [ 1, "a" ], [true, "b"] ] # OK

Terminating commas are OK before the closing square bracket.

In raw/core mode, there are no constraints on the "types" of the elements of a list (so you could "mix data types"); however schemas may validate may limit this, see below.

Comments are via the usual well-known single-line "//" and "#" (from symbol to the end of the line.), and multi-line "/*" ... "*/".

Whitespace is not relevant. Nor are newlines - except when delimiting properties not otherwise separated by commas, semicolons.

Encoding of MO is always UTF-8. Later versions of this specification may allow and define a standard header for non-UTF8 encoded MO. 

_TODO Nothing much to say / spec about "Multiline", really? No support to break long String literals?_

_TODO Probably remove? null handling: A special "null" literal keyword means same as if key is given without value, or if schema defines a struct field for which no key is given.  Examples:_



Spec: "Schema" support
----------------------

MO optionally allows for Validation and Editor completion support through "schemas", such as e.g. XSDs, or (in a Java implementation) via EMF ECore types or Java classes, or later maybe JSON Schema if somebody needs it - or other such systems. The "type" of a struct is stated simply by it's name inserted before the opening curly brace. (When using "schemas", you must use a "root struct" { }; there is no syntax to specificy the "type" of a flat list of name value pairs.) Such "types" are made available by (sometimes plugabble) "type system providers".

Types may also be specified for sub-structs nested somewhere inside the root struct (see e.g. EMF example below). However if the "type system providers" can 'derrive' the correct type from the 'context' in which the property appears then this is optional (because the schema normally specifies the type of contained objects, and unless it's an (abstract) type with subclasses, there often is only one choice). This is like the xsi:type in XML with XSD.

Here are some syntax examples:

### EMF

E.g. in XObjects, you can import EMF EClass types via root EPackage URI, or *.ecore or *.xcore file URI:

    import ecore-ns: http:///library.ecore
    import ecore-file: ../models/library.ecore
    import xcore-file: ../models/library.xcore
or

    Library {
        name: "EPFL CS Department"
        books: [{ title: "Core JDO", pages: 123 },           // there is often no need to specify the type here
                BookSubClass { title: "JS Design Patterns" } // unless there is a BookSubClass which extends Book
               ]
    }

### Java

    import java:java.swing.JPanel

    JPanel { ... } 

_TODO: Specify many details such as how constructor is used, how to create objects via a factory / DI framework, etc. etc._.

### XML XSD

    import xsd:../schemas/po.xsd

    purchaseOrder { orderDate: 1979-05-27T07:32:00Z; comment: "XSD example" } 

This is, obviously, a bit like a xsi:noNamespaceSchemaLocation.  _TODO LATER Syntax to distinguish XSD NS URI vs. *.xsd schemaLocation URL... how to support multiple schemas / namespaces, how exactly to use the "as" aliasing idea with XSD, etc.)_


MO implementations are free to do something with type information imported from such "schemas" - or not; it's AN OPTION, depending on the specific implementation, indeed in a sense one might consider all this as nothing more than 'hints', and could well just ignore this all together when parsing! In particular, any e.g. non-Java MO implementation would be able read the EMF and Java class model examples above - but would internally represent them as simple Name / Value "Hash Maps" data structures, and, in function of the language, might make it available via some form general purpose API like the initial examples (Any object pattern). Some implentations may, optionally (!), support creating 'native' objects of specific "types"... _TODO see Xobjects example/test/doc!_

Such Schemas may CONSTRAIN the allowed Values, for the purposes of (always optional) Validation, and rich Editor support. 

Extended Value Literals: MetaModel schemas such as EMF or Java may define additional allowed syntaxes for value literals, via some sort of registered Value Object Parser and "Stringifier" (e.g. EMF Data Type, with XCore _create_ and _convert_ methods). Generic MO Parsers just interpret such values as Strings. _Q TODO: Do these HAVE to be in Quotes? It's ugly... but more clear and compatible._

_TODO LATER, may be: using an "as" aliasing, example: import java:java.swing.JPanel as P; P { ... }._

_TODO LATER, may be: These import statements, which must appear as "header(s)" before the actual data, are just shortcuts, and it would technically be equally valid, but less readable, to specify type information per Struct, so e.g. for the last (Java) example : java:java.swing.JPanel { ... }_



Spec: References
----------------

_TODO LATER: It is intended to specify a syntax for basic "references" between MOBs in the future.  This is going to be something "name-based" (as opposed to "file/location based"), and will likely only work/make sense in combination with "schemas"? I'm thinking something like https://code.google.com/a/eclipselabs.org/p/efactory/wiki/Documentation#Linking and (something similar for JSON I once saw in one of the popular JavaScript frameworks, but cannot find anymore.) Maybe the '@' symbol would be a logical choice for.. "anchors" to name root structs? Note eFactory's pattern of giving name after schema type name.. but what if there is no schema type?_



Spec: Full EBNF-like syntax
---------------------------

_TODO see the [Xobjects Core Xtext grammar]() as the "normative" EBNF-like syntax (hopefully it's uncluttered and self explanatory enough? Else copy /paste and clear it up)._


Implementations (and Help!)
---------------------------

Would love any help / feedback - send a pull request with sugestions, comments - or write a parser. If you have an implementation, send a pull request for this document adding to the list below!

* Java Framework: XObjects, _TODO for usage see e.g. these tests_
* Eclipse IDE UI Tooling: XObjects (incl. eJSON) at _TODO Link incl. screencast on YouTube!_


Comparisons & Integrations
--------------------------

* to JSON: quite similar, differences include the points from [Michael Bolin's Suggested Improvements to JSON](http://bolinfest.com/essays/json.html); AND -most importantly- allows optional "typing" for rich editor support!

* to XML: conceptually similar, but different lighter syntax which reads more like a... program source?

* to YAML: _TODO - I haven't had time to read the HUGE YAML Spec yet.._ ;-)

* to ... your-favourite? Write it up and send a pull request adding to this.

JSON text coincindetially ;-) happens to actualy be valid MO syntax! _TODO check/allow: The *.properties file syntax from Java is also valid MO syntax._ (The opposite is obviously not true, as MO is richer.) 

MO source can very easily be transformed into JSON and XML in case there is any consumers that are more comfortable with those formats, and it is expected that toolkits offer support for this, such as manual Convert UI Actions in Editors, Incremental Builders in IDEs, Generators in Build Tools, or programmatic Serializers in frameworks. This conversion may be lossful, e.g. type information is typically not carried over into JSON (and that's just fine, as in e.g. a Browser JS runtime there is no need for it - but it's still very valuable at editing time).

Likewise, toolkits may offer "import" conversion from JSON to MO.  (Generalized mapping from XML to MO is imaginable as well, but expected to be more complex, and not currently specified / reference-implemented etc. See e.g. http://badgerfish.ning.com or http://en.wikipedia.org/wiki/JsonML & http://www.jsonml.org for more background on that front.)

The suggested file extension is *.mob - but that's just a suggested convention, of course.  Furthermore, double extensions style à la e.g. sample.muijs.mob is another suggested convention, allowing e.g. IDE editors to associate e.g. specific Previews and other root object type specific actions.


Acknowledgments
---------------

* [Tom Preston-Werner's TOML](https://github.com/mojombo/toml) which got me motivated to finally write all this up properly, during my February 2013 ski holidays, after I have carried this around in my head for quite a while now... ;-)
* [Sebastian Benz's EFactory](https://code.google.com/a/eclipselabs.org/p/efactory/) which is quite similar, except it's completely tied to EMF
* [Michael Bolin's Suggested Improvements to JSON](http://bolinfest.com/essays/json.html), which is implemented here
* Ed Merks & Co. (the EMF guys) for.. shapping my modeling thinking through EMF
* whoever actually created XML & JSON...
* Kai Kreuzer, for our chats about a "UI DSL" >1 year ago, which partly influenced this

